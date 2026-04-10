import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingDto, UpdateProfileDto, UploadIdProofDto } from './dto/users.dto';
import { Prisma } from '@prisma/client';

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
        // ML-Ready extended fields
        interests: dto.interests || [],
        foodPreference: dto.foodPreference,
        workSchedule: dto.workSchedule,
        languages: dto.languages || [],
        lifestyle: dto.lifestyle,
        transportMode: dto.transportMode,
        smoking: dto.smoking,
        drinking: dto.drinking,
        petFriendly: dto.petFriendly,
        ageRange: dto.ageRange,
        hometown: dto.hometown,
        courseOrDept: dto.courseOrDept,
        monthlyIncome: dto.monthlyIncome,
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
        mentorProfile: true,
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
        posts: {
          orderBy: { createdAt: 'desc' },
          include: { community: { select: { id: true, name: true } } },
        },
        housingReviews: {
          orderBy: { createdAt: 'desc' },
          include: { housing: { select: { id: true, title: true } } },
        },
        savedHousings: {
          orderBy: { createdAt: 'desc' },
          include: { housing: true },
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

  async uploadIdProof(userId: string, dto: UploadIdProofDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        idProofUrl: dto.idProofUrl,
        idProofType: dto.idProofType,
        verificationStatus: 'PENDING',
      },
    });

    const { password, ...result } = user;
    return { ...result, message: 'ID proof uploaded. Pending admin verification.' };
  }

  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationStatus: true,
        idProofType: true,
        verificationNotes: true,
        verifiedAt: true,
        isVerified: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
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

    // Recommended Insights (Alumni/Coworkers & Movers)
    const [nearbyAlumni, movingWithYou] = await Promise.all([
      this.prisma.user.count({
        where: {
          city: user.city,
          id: { not: user.id },
          OR: [
            ...(user.university ? [{ university: user.university }] : []),
            ...(user.company ? [{ company: user.company }] : []),
          ],
        },
      }),
      this.prisma.user.count({
        where: {
          city: user.city,
          moveMonth: user.moveMonth,
          id: { not: user.id },
        },
      }),
    ]);

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
      insights: {
        nearbyAlumni,
        movingWithYou,
      },
    };
  }

  // ════════════ FIND PEOPLE (PUBLIC USER SEARCH) ════════════

  async searchUsers(currentUserId: string, page = 1, limit = 20, filters?: {
    city?: string;
    role?: string;
    gender?: string;
    interests?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      isOnboarded: true,
      id: { not: currentUserId }, // Exclude self
    };

    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.role) {
      where.role = filters.role as any;
    }
    if (filters?.gender) {
      where.gender = filters.gender as any;
    }
    if (filters?.interests) {
      where.interests = { hasSome: filters.interests.split(',') };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { university: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { hometown: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          // Only public-safe fields — NO password, NO email
          id: true,
          name: true,
          avatar: true,
          role: true,
          gender: true,
          city: true,
          preferredArea: true,
          university: true,
          company: true,
          bio: true,
          interests: true,
          languages: true,
          lifestyle: true,
          foodPreference: true,
          isVerified: true,
          isMentor: true,
          hometown: true,
          courseOrDept: true,
          reputation: { select: { points: true, level: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ════════════ HOUSING INQUIRY (ROUTES TO OWNER + ADMIN) ════════════

  async sendHousingInquiry(userId: string, housingId: string, message: string) {
    const housing = await this.prisma.housing.findUnique({
      where: { id: housingId },
      select: { id: true, title: true, createdById: true },
    });
    if (!housing) throw new NotFoundException('Housing not found');

    // Find an admin user to route the message to
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const results = [];

    // 1. Message to PG owner
    if (housing.createdById) {
      const ownerMsg = await this.prisma.message.create({
        data: {
          content: `[Housing Inquiry: ${housing.title}] ${message}`,
          senderId: userId,
          receiverId: housing.createdById,
        },
      });
      results.push({ to: 'owner', messageId: ownerMsg.id });
    }

    // 2. Message to admin dashboard
    if (admin && admin.id !== housing.createdById) {
      const adminMsg = await this.prisma.message.create({
        data: {
          content: `[Housing Inquiry: ${housing.title}] ${message}`,
          senderId: userId,
          receiverId: admin.id,
        },
      });
      results.push({ to: 'admin', messageId: adminMsg.id });
    }

    return {
      success: true,
      message: 'Inquiry sent to property owner and admin',
      results,
    };
  }

  // ════════════ MENTOR APPLICATION ════════════

  async applyForMentor(userId: string, dto: { expertise: string[], experience: string, availability: string }) {
    const existing = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ForbiddenException('Already applied for mentor program');
    }

    const mentorProfile = await this.prisma.mentorProfile.create({
      data: {
        userId,
        expertise: dto.expertise,
        experience: dto.experience,
        availability: dto.availability,
      },
    });

    return mentorProfile;
  }

  // ════════════ NOTIFICATIONS ════════════

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
