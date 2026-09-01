import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ════════════ 1-TO-1 CHAT ════════════

  async getConversations(userId: string) {
    // Fetch all messages involving this user (ordered desc for last-message-first grouping)
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Collect all partner IDs in one pass
    const partnerIds: string[] = [];
    const seenPartners = new Set<string>();
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!seenPartners.has(partnerId)) {
        seenPartners.add(partnerId);
        partnerIds.push(partnerId);
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationMap.set(partnerId, {
          partner,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isFromMe: msg.senderId === userId,
          },
          unreadCount: 0, // populated below
        });
      }
    }

    // ONE bulk query for all unread counts — eliminates N+1
    if (partnerIds.length > 0) {
      const unreadRows = await this.prisma.message.groupBy({
        by: ['senderId'],
        where: {
          senderId: { in: partnerIds },
          receiverId: userId,
          isRead: false,
        },
        _count: { id: true },
      });

      for (const row of unreadRows) {
        const conv = conversationMap.get(row.senderId);
        if (conv) conv.unreadCount = row._count.id;
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

  // ════════════ COMMUNITY GROUP CHAT ════════════

  async getCommunityMessages(communityId: string, page = 1, limit = 50) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.communityMessage.findMany({
        where: { communityId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, avatar: true, isMentor: true } },
        },
      }),
      this.prisma.communityMessage.count({ where: { communityId } }),
    ]);

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async sendCommunityMessage(userId: string, communityId: string, content: string) {
    // Verify community exists
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    // Verify user is a member (or it's non-private)
    if (community.isPrivate) {
      const membership = await this.prisma.communityMember.findUnique({
        where: { userId_communityId: { userId, communityId } },
      });
      if (!membership) throw new ForbiddenException('You must be a member to chat');
    }

    const message = await this.prisma.communityMessage.create({
      data: {
        content,
        communityId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, isMentor: true } },
      },
    });

    return message;
  }
}
