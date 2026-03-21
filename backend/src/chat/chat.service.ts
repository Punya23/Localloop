import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    // Get all unique conversation partners
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Group by conversation partner
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        const unreadCount = await this.prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversationMap.set(partnerId, {
          partner,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isFromMe: msg.senderId === userId,
          },
          unreadCount,
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async getMessages(userId: string, partnerId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark received messages as read
    await this.prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
