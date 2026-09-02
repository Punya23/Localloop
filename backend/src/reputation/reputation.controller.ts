import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { CacheControl } from '../common/cache/http-cache.interceptor';

@ApiTags('Reputation')
@Controller('reputation')
export class ReputationController {
  constructor(private reputationService: ReputationService) {}

  @Get('leaderboard')
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get reputation leaderboard' })
  getLeaderboard(@Query('city') city?: string, @Query('limit') limit?: number) {
    return this.reputationService.getLeaderboard(city, limit);
  }

  @Get(':userId')
  @CacheControl({ maxAge: 30, staleWhileRevalidate: 120 })
  @ApiOperation({ summary: 'Get user reputation' })
  getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.getUserReputation(userId);
  }
}
