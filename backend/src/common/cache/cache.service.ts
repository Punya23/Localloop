import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import NodeCache from 'node-cache';

/**
 * Two-tier cache.
 *
 *  L1 — in-process `node-cache`. Always on. Zero network hops, so it is the
 *       fastest layer and the only one that matters for a single-instance
 *       deployment (which is what LocalLoop runs on Render today).
 *
 *  L2 — Redis. Opt-in, off by default. Enable it only when more than one API
 *       instance is running, because that is the point at which per-process L1
 *       caches start disagreeing with each other. When enabled, L1 stays in
 *       front of it and a Redis pub/sub channel broadcasts invalidations so
 *       every instance drops its stale L1 entries.
 *
 * Redis is activated when `REDIS_URL` points at a non-local host, or when
 * `REDIS_ENABLED=true` is set explicitly (useful for testing against a local
 * Redis). Any Redis failure degrades to L1-only rather than failing a request.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly l1: NodeCache;

  /** ioredis client for reads/writes; null when Redis is disabled or broken. */
  private redis: any = null;
  /** Second connection — a subscriber cannot issue regular commands. */
  private redisSub: any = null;
  private redisHealthy = false;

  /** De-duplicates concurrent misses on the same key (cache stampede guard). */
  private readonly inFlight = new Map<string, Promise<any>>();

  private readonly namespace = 'localloop';
  private readonly invalidationChannel = 'localloop:cache:invalidate';
  /** Identifies this process so it ignores the invalidations it published. */
  private readonly instanceId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

  static readonly TTL = {
    SHORT: 60,       // 1 min  — leaderboard, admin stats, event list
    MEDIUM: 300,     // 5 min  — communities list, similar housing, deal score
    LONG: 900,       // 15 min — city stats, area price aggregates, match pool
    VERY_LONG: 3600, // 1 hr   — static reference data
  };

  constructor() {
    this.l1 = new NodeCache({
      stdTTL: CacheService.TTL.MEDIUM,
      checkperiod: 120,
      // Values are treated as immutable snapshots and never mutated by callers,
      // so skipping the structured clone saves meaningful CPU on large payloads.
      useClones: false,
      maxKeys: 5000, // hard ceiling — protects a 512MB Render dyno from bloat
    });

    this.initRedis();
  }

  // ──────────────────────────────── Redis wiring ────────────────────────────

  private shouldUseRedis(): boolean {
    const url = process.env.REDIS_URL?.trim();
    if (!url) return false;
    if (process.env.REDIS_ENABLED === 'true') return true;
    // A localhost URL is the scaffolded default, not a deliberate deployment.
    return !/^redis(s)?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/i.test(url);
  }

  private initRedis(): void {
    if (!this.shouldUseRedis()) {
      this.logger.log('Cache: L1 (in-process) only — Redis disabled');
      return;
    }

    let Redis: any;
    try {
      // Guarded require: a missing optional dependency must not stop the app
      // from booting — it just means the L2 tier stays off.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      Redis = require('ioredis');
      Redis = Redis.default || Redis;
    } catch {
      this.logger.warn('Cache: ioredis not installed — falling back to L1 only');
      return;
    }

    const opts = {
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false, // fail fast instead of queueing during an outage
      connectTimeout: 5000,
      retryStrategy: (times: number) => (times > 10 ? null : Math.min(times * 500, 5000)),
    };

    try {
      this.redis = new Redis(process.env.REDIS_URL, opts);
      this.redisSub = new Redis(process.env.REDIS_URL, opts);

      this.redis.on('ready', () => {
        this.redisHealthy = true;
        this.logger.log('Cache: L2 Redis connected');
      });
      this.redis.on('error', (err: Error) => {
        if (this.redisHealthy) this.logger.warn(`Cache: Redis error — ${err.message}`);
        this.redisHealthy = false;
      });
      this.redis.on('end', () => {
        this.redisHealthy = false;
      });
      this.redisSub.on('error', () => undefined);

      // Cross-instance L1 invalidation.
      this.redisSub.subscribe(this.invalidationChannel).catch(() => undefined);
      this.redisSub.on('message', (_channel: string, payload: string) => {
        try {
          const { prefix, origin } = JSON.parse(payload);
          if (origin === this.instanceId) return; // already cleared locally
          this.clearL1(prefix);
        } catch {
          /* malformed payload — ignore */
        }
      });
    } catch (err: any) {
      this.logger.warn(`Cache: Redis init failed (${err?.message}) — L1 only`);
      this.redis = null;
      this.redisSub = null;
      this.redisHealthy = false;
    }
  }

  private nsKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  // ──────────────────────────────── Public API ──────────────────────────────

  async get<T>(key: string): Promise<T | undefined> {
    const local = this.l1.get<T>(key);
    if (local !== undefined) return local;

    if (!this.redisHealthy) return undefined;
    try {
      const raw = await this.redis.get(this.nsKey(key));
      if (raw == null) return undefined;
      const value = JSON.parse(raw) as T;
      this.l1.set(key, value); // hydrate L1 for subsequent hits
      return value;
    } catch {
      return undefined;
    }
  }

  /** Synchronous L1-only read, for hot paths that must not await. */
  getLocal<T>(key: string): T | undefined {
    return this.l1.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const seconds = ttl ?? CacheService.TTL.MEDIUM;
    this.l1.set(key, value, seconds);

    if (!this.redisHealthy) return;
    try {
      await this.redis.set(this.nsKey(key), JSON.stringify(value), 'EX', seconds);
    } catch {
      /* L2 write failures are non-fatal — L1 already holds the value */
    }
  }

  async del(key: string): Promise<void> {
    this.l1.del(key);
    if (!this.redisHealthy) return;
    try {
      await this.redis.del(this.nsKey(key));
    } catch {
      /* non-fatal */
    }
  }

  /**
   * Drop every key beginning with `prefix` (see `CacheKeys` for the prefix
   * vocabulary). Call this from every write path that makes cached reads stale.
   */
  async invalidatePattern(prefix: string): Promise<void> {
    const cleared = this.clearL1(prefix);
    if (cleared > 0) {
      this.logger.debug(`Cache: invalidated ${cleared} L1 keys under "${prefix}"`);
    }

    if (!this.redisHealthy) return;
    try {
      // SCAN, not KEYS — KEYS blocks the Redis event loop on large keyspaces.
      const pattern = `${this.nsKey(prefix)}*`;
      let cursor = '0';
      do {
        const [next, batch]: [string, string[]] = await this.redis.scan(
          cursor, 'MATCH', pattern, 'COUNT', 200,
        );
        cursor = next;
        if (batch.length > 0) await this.redis.del(...batch);
      } while (cursor !== '0');

      await this.redis.publish(
        this.invalidationChannel,
        JSON.stringify({ prefix, origin: this.instanceId }),
      );
    } catch {
      /* non-fatal — L1 is already clean on this instance */
    }
  }

  /** Fire-and-forget invalidation for write paths that must not await the cache. */
  invalidatePatternAsync(prefix: string): void {
    void this.invalidatePattern(prefix).catch(() => undefined);
  }

  /**
   * Read-through helper. Concurrent misses on the same key share a single
   * execution of `fn`, so a cold cache cannot fan out into N identical queries
   * against a connection pool that only holds 5 connections.
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const local = this.l1.get<T>(key);
    if (local !== undefined) return local;

    const pending = this.inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const task = (async () => {
      // Re-check L2 inside the single-flight window.
      if (this.redisHealthy) {
        try {
          const raw = await this.redis.get(this.nsKey(key));
          if (raw != null) {
            const value = JSON.parse(raw) as T;
            this.l1.set(key, value, ttl ?? CacheService.TTL.MEDIUM);
            return value;
          }
        } catch {
          /* fall through to the origin query */
        }
      }

      const result = await fn();
      await this.set(key, result, ttl);
      return result;
    })();

    this.inFlight.set(key, task);
    try {
      return await task;
    } finally {
      this.inFlight.delete(key);
    }
  }

  stats() {
    return {
      l1: this.l1.getStats(),
      l1Keys: this.l1.keys().length,
      redis: this.redisHealthy ? 'connected' : this.redis ? 'disconnected' : 'disabled',
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.l1.flushAll();
    this.l1.close();
    try {
      await this.redis?.quit();
      await this.redisSub?.quit();
    } catch {
      /* shutting down anyway */
    }
  }

  // ──────────────────────────────── Internals ───────────────────────────────

  private clearL1(prefix: string): number {
    const keys = this.l1.keys().filter((k) => k.startsWith(prefix));
    if (keys.length > 0) this.l1.del(keys);
    return keys.length;
  }
}
