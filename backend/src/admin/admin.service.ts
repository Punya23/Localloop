import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { CacheKeys } from '../common/cache/cache.keys';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private cache: CacheService) { }

  /** Verify that the requesting user is an ADMIN */
  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  /** Log an admin action for audit trail */
  private async logAction(adminId: string, action: string, targetType?: string, targetId?: string, details?: string) {
    await this.prisma.auditLog.create({
      data: { adminId, action, targetType, targetId, details },
    });
  }

  // ════════════ DASHBOARD STATS ════════════

  async getDashboardStats(adminId: string) {
    await this.assertAdmin(adminId);
    return this.cache.wrap(
      CacheKeys.adminStats,
      () => this.computeDashboardStats(),
      CacheService.TTL.SHORT,
    );
  }

  private async computeDashboardStats() {
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

  async toggleBanUser(adminId: string, targetUserId: string) {
    await this.assertAdmin(adminId);
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    // Toggle isOnboarded or we can just use verificationStatus = 'REJECTED' as a ban. Let's use REJECTED to restrict access.
    // Ideally we would add an `isBanned` field, but since we don't have it in prisma schema, we will set verificationStatus = 'REJECTED'
    const newStatus = user.verificationStatus === 'REJECTED' ? 'UNVERIFIED' : 'REJECTED';
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { verificationStatus: newStatus as any, isVerified: false },
    });
    await this.logAction(adminId, newStatus === 'REJECTED' ? 'ban_user' : 'unban_user', 'user', targetUserId);
    this.cache.invalidatePatternAsync(CacheKeys.matchPool);
    this.cache.invalidatePatternAsync(CacheKeys.admin);
    return { message: newStatus === 'REJECTED' ? 'User banned successfully' : 'User unbanned successfully' };
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

    const result = await this.prisma.user.update({
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
    await this.logAction(adminId, approved ? 'verify_user' : 'reject_user', 'user', userId, notes);
    this.cache.invalidatePatternAsync(CacheKeys.matchPool);
    this.cache.invalidatePatternAsync(CacheKeys.admin);
    return result;
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
    const result = await this.prisma.housing.update({
      where: { id: housingId },
      data: { isVerified: verified },
    });
    await this.logAction(adminId, verified ? 'verify_housing' : 'unverify_housing', 'housing', housingId);
    this.invalidateHousing();
    return result;
  }

  /** Housing aggregates (area prices, deal scores, candidate pools) + admin counters. */
  private invalidateHousing(): void {
    this.cache.invalidatePatternAsync(CacheKeys.housing);
    this.cache.invalidatePatternAsync(CacheKeys.cityStats);
    this.cache.invalidatePatternAsync(CacheKeys.admin);
  }

  /** Community lists/details + admin counters. */
  private invalidateCommunities(): void {
    this.cache.invalidatePatternAsync(CacheKeys.communities);
    this.cache.invalidatePatternAsync(CacheKeys.cityStats);
    this.cache.invalidatePatternAsync(CacheKeys.admin);
  }

  async adminCreateHousing(adminId: string, data: any) {
    await this.assertAdmin(adminId);
    const housing = await this.prisma.housing.create({
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

    this.invalidateHousing();
    return housing;
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

    await this.logAction(adminId, approved ? 'approve_mentor' : 'reject_mentor', 'mentor', mentorProfileId);
    this.cache.invalidatePatternAsync(CacheKeys.matchPool);
    this.cache.invalidatePatternAsync(CacheKeys.admin);
    return { message: approved ? 'Mentor approved' : 'Mentor rejected' };
  }

  // ════════════ MAKE USER ADMIN ════════════

  async makeAdmin(adminId: string, targetUserId: string) {
    await this.assertAdmin(adminId);
    const result = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });
    await this.logAction(adminId, 'make_admin', 'user', targetUserId, result.name);
    return result;
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

    const updated = await this.prisma.housing.update({
      where: { id: housingId },
      data: updateData,
    });

    this.invalidateHousing();
    return updated;
  }

  async deleteHousing(adminId: string, housingId: string) {
    await this.assertAdmin(adminId);
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    // Delete related records first
    await this.prisma.savedHousing.deleteMany({ where: { housingId } });
    await this.prisma.housingReview.deleteMany({ where: { housingId } });
    await this.prisma.housing.delete({ where: { id: housingId } });

    await this.logAction(adminId, 'delete_housing', 'housing', housingId, housing.title);
    this.invalidateHousing();
    return { message: 'Housing deleted successfully' };
  }

  // ════════════ COMMUNITY MANAGEMENT ════════════

  async getAllCommunities(adminId: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { members: true, posts: true } } }
      }),
      this.prisma.community.count(),
    ]);

    return { data: communities, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async verifyCommunity(adminId: string, communityId: string, verified: boolean) {
    await this.assertAdmin(adminId);
    // `findAll` only returns verified communities — this flips list membership.
    const updated = await this.prisma.community.update({
      where: { id: communityId },
      data: { isVerified: verified },
    });

    this.invalidateCommunities();
    return updated;
  }

  async deleteCommunity(adminId: string, communityId: string) {
    await this.assertAdmin(adminId);
    const community = await this.prisma.community.findUnique({ where: { id: communityId } });
    if (!community) throw new NotFoundException('Community not found');

    await this.prisma.community.delete({ where: { id: communityId } });
    await this.logAction(adminId, 'delete_community', 'community', communityId, community.name);
    this.invalidateCommunities();
    return { message: 'Community deleted successfully' };
  }

  // ════════════ PUSH NOTIFICATIONS ════════════

  async sendPushNotification(adminId: string, title: string, message: string) {
    await this.assertAdmin(adminId);

    // Create actual notifications for all users
    const users = await this.prisma.user.findMany({ select: { id: true } });

    const notifications = users.map(user => ({
      userId: user.id,
      title,
      description: message,
      type: 'admin',
      isRead: false,
    }));

    await this.prisma.notification.createMany({
      data: notifications,
    });

    await this.logAction(adminId, 'broadcast_notification', 'notification', undefined, `"${title}" → ${users.length} users`);
    return { success: true, message: `Notification broadcasted to ${users.length} users successfully`, timestamp: new Date() };
  }

  // ════════════ NOTIFICATION HISTORY ════════════

  async getNotificationHistory(adminId: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    // Get distinct admin notifications grouped by title+description (each broadcast)
    const [broadcasts, total] = await Promise.all([
      this.prisma.$queryRaw`
        SELECT title, description, "createdAt", COUNT(*)::int as "recipientCount"
        FROM notifications
        WHERE type = 'admin'
        GROUP BY title, description, "createdAt"
        ORDER BY "createdAt" DESC
        LIMIT ${limit} OFFSET ${skip}
      ` as Promise<any[]>,
      this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT (title, description, "createdAt"))::int as count
        FROM notifications
        WHERE type = 'admin'
      ` as Promise<any[]>,
    ]);

    return {
      data: broadcasts,
      meta: { total: total[0]?.count || 0, page, limit, totalPages: Math.ceil((total[0]?.count || 0) / limit) },
    };
  }

  // ════════════ REPORTS / FLAGGED CONTENT ════════════

  async getReports(adminId: string, status?: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data: reports, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async resolveReport(adminId: string, reportId: string, status: string, adminNotes?: string) {
    await this.assertAdmin(adminId);
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const result = await this.prisma.report.update({
      where: { id: reportId },
      data: { status, adminNotes, resolvedBy: adminId, resolvedAt: new Date() },
    });
    await this.logAction(adminId, 'resolve_report', 'report', reportId, `${status}: ${adminNotes || 'No notes'}`);
    return result;
  }

  // ════════════ AUDIT LOG ════════════

  async getAuditLog(adminId: string, page = 1, limit = 30) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ════════════ EVENTS MANAGEMENT ════════════

  async getAllEvents(adminId: string, page = 1, limit = 20) {
    await this.assertAdmin(adminId);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          community: { select: { id: true, name: true } },
          _count: { select: { attendees: true } },
        },
      }),
      this.prisma.event.count(),
    ]);

    return { data: events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async deleteEvent(adminId: string, eventId: string) {
    await this.assertAdmin(adminId);
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    await this.prisma.eventAttendee.deleteMany({ where: { eventId } });
    await this.prisma.event.delete({ where: { id: eventId } });
    this.cache.invalidatePatternAsync(CacheKeys.events);
    await this.logAction(adminId, 'delete_event', 'event', eventId, event.title);
    return { message: 'Event deleted successfully' };
  }
}

