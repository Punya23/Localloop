import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, CreateCommentDto } from './dto/posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post in a community' })
  create(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.sub, dto);
  }

  @Get('community/:id')
  @ApiOperation({ summary: 'Get posts by community' })
  findByCommunity(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.findByCommunity(id, page, limit);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to a post' })
  addComment(@Request() req: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.postsService.addComment(req.user.sub, id, dto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  deletePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.deletePost(req.user.sub, id);
  }
}
