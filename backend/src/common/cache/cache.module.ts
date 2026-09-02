import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './cache.service';
import { HttpCacheInterceptor } from './http-cache.interceptor';

/**
 * Global cache wiring:
 *  - `CacheService`         — L1 in-process cache (+ optional L2 Redis)
 *  - `HttpCacheInterceptor` — emits Cache-Control for handlers marked with
 *                             `@CacheControl(...)`; a no-op everywhere else.
 */
@Global()
@Module({
  providers: [
    CacheService,
    { provide: APP_INTERCEPTOR, useClass: HttpCacheInterceptor },
  ],
  exports: [CacheService],
})
export class AppCacheModule {}
