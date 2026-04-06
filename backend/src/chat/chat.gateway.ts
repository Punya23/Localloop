import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const payload = this.jwtService.verify(data.token);
      this.connectedUsers.set(client.id, payload.sub);
      client.join(`user_${payload.sub}`);
      return { event: 'registered', data: { success: true } };
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      client.disconnect();
      return { event: 'registered', data: { success: false, error: 'Unauthorized' } };
    }
  }

  // ════════════ 1-TO-1 MESSAGING ════════════

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authId = this.connectedUsers.get(client.id);
    if (!authId || authId !== data.senderId) {
      console.warn(`Impersonation blocked: Socket ${client.id} tried to send as ${data.senderId}`);
      return { error: 'Unauthorized' };
    }
    // Save message to database
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        receiverId: data.receiverId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Emit to receiver
    this.server.to(`user_${data.receiverId}`).emit('receive_message', message);

    // Emit back to sender for confirmation
    client.emit('message_sent', message);

    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { senderId: string; receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`user_${data.receiverId}`).emit('user_typing', {
      userId: data.senderId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { userId: string; senderId: string },
  ) {
    await this.prisma.message.updateMany({
      where: {
        senderId: data.senderId,
        receiverId: data.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  // ════════════ COMMUNITY GROUP CHAT ════════════

  @SubscribeMessage('join_community')
  handleJoinCommunity(
    @MessageBody() data: { communityId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`community_${data.communityId}`);
    return { event: 'joined_community', data: { communityId: data.communityId } };
  }

  @SubscribeMessage('leave_community')
  handleLeaveCommunity(
    @MessageBody() data: { communityId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`community_${data.communityId}`);
    return { event: 'left_community', data: { communityId: data.communityId } };
  }

  @SubscribeMessage('send_community_message')
  async handleCommunityMessage(
    @MessageBody() data: { userId: string; communityId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authId = this.connectedUsers.get(client.id);
    if (!authId || authId !== data.userId) {
      console.warn(`Impersonation blocked: Socket ${client.id} tried to send community message as ${data.userId}`);
      return { error: 'Unauthorized' };
    }
    // Save to database
    const message = await this.prisma.communityMessage.create({
      data: {
        content: data.content,
        communityId: data.communityId,
        userId: data.userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Broadcast to all members in the community room
    this.server.to(`community_${data.communityId}`).emit('community_message', message);

    return message;
  }

  @SubscribeMessage('community_typing')
  handleCommunityTyping(
    @MessageBody() data: { userId: string; communityId: string; isTyping: boolean; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`community_${data.communityId}`).emit('community_user_typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping,
    });
  }
}
