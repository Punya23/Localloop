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

    await this.prisma.communityMember.create({
      data: { userId, communityId },
    });

    // Update member count
    await this.prisma.community.update({
      where: { id: communityId },
      data: { memberCount: { increment: 1 } },
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

    await this.prisma.communityMember.delete({
      where: { id: membership.id },
    });

    await this.prisma.community.update({
      where: { id: communityId },
      data: { memberCount: { decrement: 1 } },
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
}
