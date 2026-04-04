import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /** Verify that the requesting user is an ADMIN */
  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  // ════════════ DASHBOARD STATS ════════════

  async getDashboardStats(adminId: string) {
    await this.assertAdmin(adminId);

    const [totalUsers, verifiedUsers, pendingVerifications, totalHousings, verifiedHousings, totalCommunities, totalMentors, pendingMentors] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isVerified: true } }),
      this.prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.housing.count(),
      this.prisma.housing.count({ where: { isVerified: true } }),
      this.prisma.community.count(),
      this.prisma.mentorProfile.count({ where: { isApproved: true } }),
      this.prisma.mentorProfile.count({ where: { isApproved: false } }),
    ]);

    return {
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      totalHousings,
      verifiedHousings,
      totalCommunities,
      totalMentors,
      pendingMentors,
    };
  }

  // ════════════ USER MANAGEMENT ════════════

  async getAllUsers(adminId: string, page = 1, limit = 20, search?: string) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          gender: true,
          city: true,
          isVerified: true,
          verificationStatus: true,
          isOnboarded: true,
          isMentor: true,
          createdAt: true,
          reputation: { select: { points: true, level: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getUserDetail(adminId: string, userId: string) {
    await this.assertAdmin(adminId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reputation: true,
        mentorProfile: true,
        _count: {
          select: { posts: true, housings: true, housingReviews: true, communities: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  // ════════════ VERIFICATION ════════════

  async getPendingVerifications(adminId: string) {
    await this.assertAdmin(adminId);
    return this.prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        idProofUrl: true,
        idProofType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async verifyUser(adminId: string, userId: string, approved: boolean, notes?: string) {
    await this.assertAdmin(adminId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
        isVerified: approved,
        verificationNotes: notes || null,
        verifiedAt: new Date(),
        verifiedBy: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        isVerified: true,
        verificationNotes: true,
        verifiedAt: true,
      },
    });
  }

  // ════════════ HOUSING MANAGEMENT ════════════

  async getAllHousings(adminId: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    const [housings, total] = await Promise.all([
      this.prisma.housing.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.housing.count(),
    ]);

    return { data: housings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async verifyHousing(adminId: string, housingId: string, verified: boolean) {
    await this.assertAdmin(adminId);
    return this.prisma.housing.update({
      where: { id: housingId },
      data: { isVerified: verified },
    });
  }

  async adminCreateHousing(adminId: string, data: any) {
    await this.assertAdmin(adminId);
    return this.prisma.housing.create({
      data: {
        title: data.title,
        description: data.description,
        address: data.address,
        area: data.area,
        city: data.city || 'Pune',
        rent: data.rent,
        deposit: data.deposit,
        type: data.type,
        genderPreference: data.genderPreference || 'ANY',
        amenities: data.amenities || [],
        images: data.images || [],
        isWomenFriendly: data.isWomenFriendly || false,
        isVerified: true, // Admin-created listings are auto-verified
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        createdById: adminId,
      },
    });
  }

  // ════════════ MENTOR MANAGEMENT ════════════

  async getPendingMentors(adminId: string) {
    await this.assertAdmin(adminId);
    return this.prisma.mentorProfile.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: { id: true, name: true, email: true, city: true, role: true, isVerified: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveMentor(adminId: string, mentorProfileId: string, approved: boolean) {
    await this.assertAdmin(adminId);
    const profile = await this.prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
    });
    if (!profile) throw new NotFoundException('Mentor profile not found');

    await this.prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data: { isApproved: approved },
    });

    // Also update user.isMentor flag
    await this.prisma.user.update({
      where: { id: profile.userId },
      data: { isMentor: approved },
    });

    return { message: approved ? 'Mentor approved' : 'Mentor rejected' };
  }

  // ════════════ MAKE USER ADMIN ════════════

  async makeAdmin(adminId: string, targetUserId: string) {
    await this.assertAdmin(adminId);
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  // ════════════ ADMIN MESSAGES (Inquiries) ════════════

  async getMessages(adminId: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { receiverId: adminId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      this.prisma.message.count({ where: { receiverId: adminId } }),
    ]);

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ════════════ HOUSING CRUD ════════════

  async updateHousing(adminId: string, housingId: string, data: any) {
    await this.assertAdmin(adminId);
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.rent !== undefined) updateData.rent = data.rent;
    if (data.deposit !== undefined) updateData.deposit = data.deposit;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.genderPreference !== undefined) updateData.genderPreference = data.genderPreference;
    if (data.amenities !== undefined) updateData.amenities = data.amenities;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.isWomenFriendly !== undefined) updateData.isWomenFriendly = data.isWomenFriendly;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;

    return this.prisma.housing.update({
      where: { id: housingId },
      data: updateData,
    });
  }

  async deleteHousing(adminId: string, housingId: string) {
    await this.assertAdmin(adminId);
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    // Delete related records first
    await this.prisma.savedHousing.deleteMany({ where: { housingId } });
    await this.prisma.housingReview.deleteMany({ where: { housingId } });
    await this.prisma.housing.delete({ where: { id: housingId } });

    return { message: 'Housing deleted successfully' };
  }
}

