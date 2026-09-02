/**
 * Central registry of cache-key builders and invalidation prefixes.
 *
 * Every cached value lives under a stable, greppable prefix so that writes can
 * invalidate a whole family of keys with one `invalidatePattern()` call.
 * Keep this file as the single source of truth — never hand-roll key strings
 * inside a service.
 */
export const CacheKeys = {
  // ── Communities ──
  communities: 'communities',
  communityList: (city?: string) => `communities:list:${city?.toLowerCase() || 'all'}`,
  communityDetail: (id: string) => `communities:detail:${id}`,

  // ── Events ──
  events: 'events',
  eventList: (upcoming: boolean) => `events:list:${upcoming ? 'upcoming' : 'all'}`,

  // ── Reputation ──
  leaderboard: 'leaderboard',
  leaderboardList: (city: string | undefined, limit: number) =>
    `leaderboard:${city?.toLowerCase() || 'all'}:${limit}`,

  // ── Housing / price intelligence ──
  housing: 'housing',
  areaPrices: (city: string) => `housing:areaprices:${city.toLowerCase()}`,
  areaDetail: (area: string, city: string) =>
    `housing:areadetail:${city.toLowerCase()}:${area.toLowerCase()}`,
  dealScore: (housingId: string) => `housing:dealscore:${housingId}`,
  similarHousing: (housingId: string, limit: number) =>
    `housing:similar:${housingId}:${limit}`,
  housingCandidates: (city: string) => `housing:candidates:${city.toLowerCase()}`,
  chatbotContext: (city: string) => `housing:chatctx:${city.toLowerCase()}`,

  // ── City-wide aggregates shown on the dashboard ──
  cityStats: 'citystats',
  cityStatsFor: (city: string) => `citystats:${city.toLowerCase()}`,

  // ── Smart match candidate pool (scoring stays per-request) ──
  matchPool: 'matchpool',
  matchPoolFor: (city: string) => `matchpool:${city.toLowerCase()}`,

  // ── Admin ──
  admin: 'admin',
  adminStats: 'admin:stats',
} as const;
