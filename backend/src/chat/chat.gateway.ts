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

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(client.id, data.userId);
    client.join(`user_${data.userId}`);
    return { event: 'registered', data: { success: true } };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
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
}
