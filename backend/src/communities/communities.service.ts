import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/communities.dto';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommunityDto) {
    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type as any,
        city: dto.city || 'Pune',
        isPrivate: dto.isPrivate || false,
        isWomenOnly: dto.isWomenOnly || false,
        createdById: userId,
        memberCount: 1,
      },
    });

    // Auto-join creator as admin
    await this.prisma.communityMember.create({
      data: {
        userId,
        communityId: community.id,
        role: 'ADMIN',
      },
    });

    return community;
  }

  async findAll(userId?: string, city?: string) {
    const communities = await this.prisma.community.findMany({
      where: {
        ...(city && { city: { contains: city, mode: 'insensitive' as any } }),
      },
      orderBy: { memberCount: 'desc' },
      include: {
        _count: {
          select: { posts: true, members: true },
        },
      },
    });

    // Check if user is a member of each community
    if (userId) {
      const memberships = await this.prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });
      const memberCommunityIds = new Set(memberships.map((m) => m.communityId));

      return communities.map((c) => ({
        ...c,
        isMember: memberCommunityIds.has(c.id),
      }));
    }

    return communities;
  }

  async findOne(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          take: 20,
        },
        _count: {
          select: { posts: true, members: true, events: true },
        },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  async join(userId: string, communityId: string) {
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    // Check if already a member
    const existing = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
    });

    if (existing) {
      throw new ConflictException('Already a member of this community');
    }

    // Check women-only restriction
    if (community.isWomenOnly) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.gender !== 'FEMALE') {
        throw new ForbiddenException('This community is women-only');
      }
    }

    // Use transaction to ensure accuracy
    await this.prisma.$transaction(async (tx) => {
      await tx.communityMember.create({
        data: { userId, communityId },
      });

      // Update member count
      await tx.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      });
    });

    return { message: 'Joined community successfully' };
  }

  async leave(userId: string, communityId: string) {
    const membership = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
    });

    if (!membership) {
      throw new NotFoundException('Not a member of this community');
    }

    // Use transaction to ensure accuracy
    await this.prisma.$transaction(async (tx) => {
      await tx.communityMember.delete({
        where: { id: membership.id },
      });

      await tx.community.update({
        where: { id: communityId },
        data: { memberCount: { decrement: 1 } },
      });
    });

    return { message: 'Left community successfully' };
  }

  async getMyCommunitites(userId: string) {
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: {
          include: {
            _count: { select: { posts: true, members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.community,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  // ════════════ MEMBERS ════════════

  async getMembers(communityId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.communityMember.findMany({
        where: { communityId },
        skip,
        take: limit,
        orderBy: [{ role: 'desc' }, { joinedAt: 'asc' }],
        include: {
          user: {
            select: { id: true, name: true, avatar: true, bio: true, city: true, company: true, university: true },
          },
        },
      }),
      this.prisma.communityMember.count({ where: { communityId } }),
    ]);

    return {
      data: members,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ════════════ POLLS ════════════

  async getPolls(communityId: string) {
    const polls = await this.prisma.communityPoll.findMany({
      where: { communityId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        votes: { select: { userId: true, optionIndex: true } },
      },
    });

    return polls;
  }

  async createPoll(userId: string, communityId: string, question: string, options: string[], expiresInDays: number = 7) {
    // Verify membership
    const member = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId } },
    });

    if (!member) throw new ForbiddenException('Only members can create polls');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return this.prisma.communityPoll.create({
      data: {
        question,
        options,
        communityId,
        createdById: userId,
        expiresAt,
      },
    });
  }

  async votePoll(userId: string, pollId: string, optionIndex: number) {
    const poll = await this.prisma.communityPoll.findUnique({
      where: { id: pollId },
      select: { communityId: true, expiresAt: true },
    });

    if (!poll) throw new NotFoundException('Poll not found');

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      throw new ForbiddenException('This poll has expired');
    }

    // Verify membership
    const member = await this.prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: poll.communityId } },
    });

    if (!member) throw new ForbiddenException('Only members can vote');

    // Upsert vote
    return this.prisma.pollVote.upsert({
      where: { pollId_userId: { pollId, userId } },
      update: { optionIndex },
      create: {
        pollId,
        userId,
        optionIndex,
      },
    });
  }
}
