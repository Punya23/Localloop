import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

export const HTTP_CACHE_KEY = 'http-cache-control';

export interface HttpCacheOptions {
  /** Seconds a shared cache (CDN/proxy) may serve the response without revalidating. */
  maxAge: number;
  /** Seconds a stale response may still be served while it is refreshed behind the scenes. */
  staleWhileRevalidate?: number;
  /**
   * Mark the response as private (browser-only). Use for anything that varies
   * by the authenticated user — a shared cache must never hold those.
   */
  private?: boolean;
}

/**
 * Declares browser/CDN caching for a GET handler.
 *
 * This is the outermost cache tier: the in-process `CacheService` stops repeat
 * work inside the API, and this stops the request from reaching the API at all.
 * Only put it on endpoints whose body does not depend on the caller's identity,
 * unless `private: true` is set.
 */
export const CacheControl = (options: HttpCacheOptions) =>
  SetMetadata(HTTP_CACHE_KEY, options);

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.getAllAndOverride<HttpCacheOptions | undefined>(
      HTTP_CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return next.handle();

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    if (req.method !== 'GET') return next.handle();

    return next.handle().pipe(
      tap(() => {
        const res = http.getResponse<Response>();
        // Never overwrite a header a handler set deliberately.
        if (res.getHeader('Cache-Control')) return;

        const scope = options.private ? 'private' : 'public';
        const parts = [scope, `max-age=${options.maxAge}`];
        if (options.staleWhileRevalidate) {
          parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
        }
        res.setHeader('Cache-Control', parts.join(', '));

        // Auth-dependent bodies must not be served to a different bearer token.
        // CORS and compression already set Vary, so append rather than replace.
        if (options.private) {
          const existing = res.getHeader('Vary');
          const values = String(existing ?? '')
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
          if (!values.some((v) => v.toLowerCase() === 'authorization')) {
            values.push('Authorization');
          }
          res.setHeader('Vary', values.join(', '));
        }
      }),
    );
  }
}
