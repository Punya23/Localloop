import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHousingDto, HousingFilterDto, CreateReviewDto } from './dto/housing.dto';

@Injectable()
export class HousingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateHousingDto) {
    return this.prisma.housing.create({
      data: {
        title: dto.title,
        description: dto.description,
        address: dto.address,
        area: dto.area,
        city: dto.city || 'Pune',
        rent: dto.rent,
        deposit: dto.deposit,
        type: dto.type as any,
        genderPreference: (dto.genderPreference as any) || 'ANY',
        amenities: dto.amenities || [],
        images: dto.images || [],
        isWomenFriendly: dto.isWomenFriendly || false,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findAll(filters: HousingFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.area) where.area = { contains: filters.area, mode: 'insensitive' };
    if (filters.type) where.type = filters.type;
    if (filters.genderPreference) where.genderPreference = filters.genderPreference;
    if (filters.isWomenFriendly) where.isWomenFriendly = true;

    if (filters.budgetMin || filters.budgetMax) {
      where.rent = {};
      if (filters.budgetMin) where.rent.gte = filters.budgetMin;
      if (filters.budgetMax) where.rent.lte = filters.budgetMax;
    }

    const [housings, total] = await Promise.all([
      this.prisma.housing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { reviews: true, savedBy: true },
          },
        },
      }),
      this.prisma.housing.count({ where }),
    ]);

    // Calculate average rating for each housing
    const housingsWithRating = housings.map((h) => ({
      ...h,
      avgRating:
        h.reviews.length > 0
          ? Math.round((h.reviews.reduce((sum, r) => sum + r.rating, 0) / h.reviews.length) * 10) / 10
          : null,
      reviewCount: h._count.reviews,
    }));

    return {
      data: housingsWithRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const housing = await this.prisma.housing.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { reviews: true, savedBy: true },
        },
      },
    });

    if (!housing) {
      throw new NotFoundException('Housing not found');
    }

    const avgRating =
      housing.reviews.length > 0
        ? Math.round((housing.reviews.reduce((sum, r) => sum + r.rating, 0) / housing.reviews.length) * 10) / 10
        : null;

    return { ...housing, avgRating };
  }

  async createReview(userId: string, housingId: string, dto: CreateReviewDto) {
    // Verify housing exists
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    // Can't review own listing
    if (housing.createdById === userId) {
      throw new ForbiddenException('Cannot review your own listing');
    }

    const review = await this.prisma.housingReview.create({
      data: {
        rating: Math.min(5, Math.max(1, dto.rating)),
        review: dto.review,
        userId,
        housingId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Award reputation points for reviewing
    await this.prisma.reputation.updateMany({
      where: { userId },
      data: { points: { increment: 10 } },
    });

    return review;
  }

  async saveHousing(userId: string, housingId: string) {
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    // Toggle save
    const existing = await this.prisma.savedHousing.findUnique({
      where: { userId_housingId: { userId, housingId } },
    });

    if (existing) {
      await this.prisma.savedHousing.delete({
        where: { id: existing.id },
      });
      return { saved: false, message: 'Housing unsaved' };
    }

    await this.prisma.savedHousing.create({
      data: { userId, housingId },
    });

    return { saved: true, message: 'Housing saved' };
  }

  async getSavedHousings(userId: string) {
    const saved = await this.prisma.savedHousing.findMany({
      where: { userId },
      include: {
        housing: {
          include: {
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map((s) => ({
      ...s.housing,
      avgRating:
        s.housing.reviews.length > 0
          ? Math.round(
              (s.housing.reviews.reduce((sum, r) => sum + r.rating, 0) / s.housing.reviews.length) * 10,
            ) / 10
          : null,
      savedAt: s.createdAt,
    }));
  }
}
