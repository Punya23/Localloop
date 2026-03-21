import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';

@ApiTags('Reputation')
@Controller('reputation')
export class ReputationController {
  constructor(private reputationService: ReputationService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get reputation leaderboard' })
  getLeaderboard(@Query('city') city?: string, @Query('limit') limit?: number) {
    return this.reputationService.getLeaderboard(city, limit);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user reputation' })
  getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.getUserReputation(userId);
  }
}
