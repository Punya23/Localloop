import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/communities.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheControl } from '../common/cache/http-cache.interceptor';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get()
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get all communities' })
  findAll(@Query('city') city?: string) {
    return this.communitiesService.findAll(undefined, city);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my communities' })
  getMyCommunities(@Request() req: any) {
    return this.communitiesService.getMyCommunitites(req.user.sub);
  }

  @Get(':id')
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get community by ID' })
  findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create community' })
  create(@Request() req: any, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.sub, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join community' })
  join(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.join(req.user.sub, id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave community' })
  leave(@Request() req: any, @Param('id') id: string) {
    return this.communitiesService.leave(req.user.sub, id);
  }

  // ════════════ MEMBERS ════════════

  @Get(':id/members')
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get community members' })
  getMembers(@Param('id') id: string, @Query('page') page?: string) {
    return this.communitiesService.getMembers(id, page ? parseInt(page, 10) : 1);
  }

  // ════════════ POLLS ════════════

  @Get(':id/polls')
  @ApiOperation({ summary: 'Get community polls' })
  getPolls(@Param('id') id: string) {
    return this.communitiesService.getPolls(id);
  }

  @Post(':id/polls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create community poll' })
  createPoll(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { question: string; options: string[]; expiresInDays?: number },
  ) {
    return this.communitiesService.createPoll(req.user.sub, id, body.question, body.options, body.expiresInDays);
  }

  @Post(':id/polls/:pollId/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on community poll' })
  votePoll(
    @Request() req: any,
    @Param('id') communityId: string, // Not strictly needed for logic but good for restful URL
    @Param('pollId') pollId: string,
    @Body() body: { optionIndex: number },
  ) {
    return this.communitiesService.votePoll(req.user.sub, pollId, body.optionIndex);
  }
}
