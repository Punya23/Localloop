import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/communities.dto';
import { CacheService } from '../common/cache/cache.service';
import { CacheKeys } from '../common/cache/cache.keys';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

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
      data: { userId, communityId: community.id, role: 'ADMIN' },
    });

    // A new community changes every cached list (any city filter can match it)
    // and the city-level counts on the dashboard.
    this.cache.invalidatePatternAsync(CacheKeys.communities);
    this.cache.invalidatePatternAsync(CacheKeys.cityStats);

    return community;
  }

  async findAll(userId?: string, city?: string) {
    // The list itself is identical for everyone, so it is cached once per city
    // rather than once per (city, user) — otherwise the keyspace grows with the
    // user base and the hit rate collapses.
    const communities = await this.cache.wrap(
      CacheKeys.communityList(city),
      async () => {
        const rows = await this.prisma.community.findMany({
          where: {
            isVerified: true,
            ...(city && { city: { contains: city, mode: 'insensitive' as any } }),
          },
          orderBy: { memberCount: 'desc' },
          take: 100,
          include: {
            _count: { select: { posts: true, members: true } },
          },
        });
        return rows;
      },
      CacheService.TTL.MEDIUM,
    );

    if (!userId) {
      return communities.map((c) => ({ ...c, isMember: false }));
    }

    // One indexed lookup (community_members.userId) resolves membership for the
    // whole page — no per-community round-trip, no per-user cache entry.
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId, communityId: { in: communities.map((c) => c.id) } },
      select: { communityId: true },
    });
    const joined = new Set(memberships.map((m) => m.communityId));

    return communities.map((c) => ({ ...c, isMember: joined.has(c.id) }));
  }

  async findOne(id: string) {
    return this.cache.wrap(
      CacheKeys.communityDetail(id),
      () => this.fetchCommunity(id),
      CacheService.TTL.MEDIUM,
    );
  }

  private async fetchCommunity(id: string) {
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

    // memberCount, isMember and the member list are all now stale.
    this.cache.invalidatePatternAsync(CacheKeys.communities);

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

    this.cache.invalidatePatternAsync(CacheKeys.communities);

    return { message: 'Left community successfully' };
  }

  async getMyCommunitites(userId: string) {
    return this.cache.wrap(
      `${CacheKeys.communities}:mine:${userId}`,
      () => this.fetchMyCommunities(userId),
      CacheService.TTL.SHORT,
    );
  }

  private async fetchMyCommunities(userId: string) {
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
            select: { id: true, name: true, avatar: true, bio: true, city: true, company: true, university: true, isMentor: true },
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
