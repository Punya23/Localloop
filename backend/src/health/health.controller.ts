import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  /**
   * Cheap liveness probe, also used by the frontend to pre-warm a sleeping
   * Render free-tier dyno the instant a page loads — well before the user
   * finishes typing on the login form. A trivial query (rather than a bare
   * 200) also forces the Postgres connection pool to open now instead of on
   * the user's first real request, since that handshake is the slow part of
   * a cold start, not the Node process boot itself.
   */
  @Get()
  @ApiOperation({ summary: 'Liveness probe / cold-start warm-up' })
  async check() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'up', latencyMs: Date.now() - start };
    } catch {
      // Still 200 — the process itself is alive even if the DB hiccups —
      // callers only use this to know the server has woken up.
      return { status: 'ok', db: 'down', latencyMs: Date.now() - start };
    }
  }
}
