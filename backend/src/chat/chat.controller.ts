import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.sub);
  }

  @Get('messages/:partnerId')
  @ApiOperation({ summary: 'Get messages with a user' })
  getMessages(
    @Request() req: any,
    @Param('partnerId') partnerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(req.user.sub, partnerId, page, limit);
  }
}
