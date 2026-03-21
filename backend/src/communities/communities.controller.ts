import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/communities.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get()
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
}
