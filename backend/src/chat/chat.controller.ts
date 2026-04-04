import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.sub);
  }

  @Get('messages/:partnerId')
  @ApiOperation({ summary: 'Get messages with a specific user' })
  @ApiQuery({ name: 'page', required: false })
  getMessages(
    @Request() req: any,
    @Param('partnerId') partnerId: string,
    @Query('page') page?: number,
  ) {
    return this.chatService.getMessages(req.user.sub, partnerId, page || 1);
  }

  // ════════════ COMMUNITY GROUP CHAT ════════════

  @Get('community/:communityId')
  @ApiOperation({ summary: 'Get community group chat messages' })
  @ApiQuery({ name: 'page', required: false })
  getCommunityMessages(
    @Param('communityId') communityId: string,
    @Query('page') page?: number,
  ) {
    return this.chatService.getCommunityMessages(communityId, page || 1);
  }

  @Post('community/:communityId')
  @ApiOperation({ summary: 'Send a message in community group chat' })
  sendCommunityMessage(
    @Request() req: any,
    @Param('communityId') communityId: string,
    @Body() body: { content: string },
  ) {
    return this.chatService.sendCommunityMessage(req.user.sub, communityId, body.content);
  }
}
