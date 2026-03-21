import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingDto, UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: dto.role as any,
        gender: dto.gender as any,
        city: dto.city || 'Pune',
        preferredArea: dto.preferredArea,
        moveMonth: dto.moveMonth,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        isWomenMode: dto.isWomenMode || false,
        university: dto.university,
        company: dto.company,
        bio: dto.bio,
        phone: dto.phone,
        isOnboarded: true,
      },
      include: {
        reputation: true,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reputation: true,
        communities: {
          include: {
            community: {
              select: {
                id: true,
                name: true,
                type: true,
                memberCount: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            housingReviews: true,
            savedHousings: true,
            housings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      include: { reputation: true },
    });

    const { password, ...result } = user;
    return result;
  }

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { reputation: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get recommended housing based on user preferences
    const recommendedHousing = await this.prisma.housing.findMany({
      where: {
        city: user.city || 'Pune',
        ...(user.budgetMax && { rent: { lte: user.budgetMax } }),
        ...(user.budgetMin && { rent: { gte: user.budgetMin } }),
        ...(user.preferredArea && { area: { contains: user.preferredArea, mode: 'insensitive' as any } }),
        ...(user.isWomenMode && { isWomenFriendly: true }),
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Get suggested communities
    const suggestedCommunities = await this.prisma.community.findMany({
      where: {
        city: user.city || 'Pune',
        ...(user.isWomenMode && { isWomenOnly: true }),
        members: {
          none: { userId },
        },
      },
      take: 5,
      orderBy: { memberCount: 'desc' },
    });

    // Get user's communities
    const myCommunities = await this.prisma.communityMember.findMany({
      where: { userId },
      include: {
        community: true,
      },
      take: 5,
    });

    // Get upcoming events
    const upcomingEvents = await this.prisma.event.findMany({
      where: {
        date: { gte: new Date() },
      },
      take: 5,
      orderBy: { date: 'asc' },
      include: {
        _count: { select: { attendees: true } },
      },
    });

    // Get recent community posts
    const recentPosts = await this.prisma.post.findMany({
      where: {
        community: {
          members: { some: { userId } },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        community: {
          select: { id: true, name: true },
        },
        _count: { select: { comments: true } },
      },
    });

    // City stats
    const cityStats = {
      averageRent: await this.prisma.housing.aggregate({
        _avg: { rent: true },
        where: { city: user.city || 'Pune' },
      }),
      totalListings: await this.prisma.housing.count({
        where: { city: user.city || 'Pune' },
      }),
      totalCommunities: await this.prisma.community.count({
        where: { city: user.city || 'Pune' },
      }),
      totalUsers: await this.prisma.user.count({
        where: { city: user.city || 'Pune' },
      }),
    };

    return {
      user: (() => { const { password, ...u } = user; return u; })(),
      recommendedHousing,
      suggestedCommunities,
      myCommunities: myCommunities.map((m) => m.community),
      upcomingEvents,
      recentPosts,
      cityStats: {
        averageRent: Math.round(cityStats.averageRent._avg.rent || 0),
        totalListings: cityStats.totalListings,
        totalCommunities: cityStats.totalCommunities,
        totalUsers: cityStats.totalUsers,
      },
    };
  }
}
