import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReputationService } from '../reputation/reputation.service';
import { CreateHousingDto, HousingFilterDto, CreateReviewDto } from './dto/housing.dto';
import { CacheService } from '../common/cache/cache.service';
import { CacheKeys } from '../common/cache/cache.keys';

@Injectable()
export class HousingService {
  constructor(
    private prisma: PrismaService,
    private reputationService: ReputationService,
    private cache: CacheService,
  ) {}

  /**
   * Everything derived from the housing table — area price aggregates, deal
   * scores, similar listings, recommendation candidate pools — plus the
   * city-level counters on the dashboard.
   */
  private invalidateHousingDerived(): void {
    this.cache.invalidatePatternAsync(CacheKeys.housing);
    this.cache.invalidatePatternAsync(CacheKeys.cityStats);
  }

  private async getCoords(address: string, area: string, city: string) {
    try {
      const query = `${address}, ${area}, ${city}, India`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'LocalLoopApp/1.0' } });
      const data: any = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
    return null;
  }

  async create(userId: string, dto: CreateHousingDto) {
    const coords = await this.getCoords(dto.address, dto.area, dto.city || 'Pune');

    const housing = await this.prisma.housing.create({
      data: {
        title: dto.title,
        description: dto.description,
        address: dto.address,
        area: dto.area,
        city: dto.city,
        rent: dto.rent,
        deposit: dto.deposit,
        type: dto.type as any,
        genderPreference: (dto.genderPreference as any) || 'ANY',
        amenities: dto.amenities || [],
        images: dto.images || [],
        isWomenFriendly: dto.isWomenFriendly || false,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        latitude: coords?.lat,
        longitude: coords?.lon,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    this.invalidateHousingDerived();
    return housing;
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
          _count: {
            select: { reviews: true, savedBy: true },
          },
        },
      }),
      this.prisma.housing.count({ where }),
    ]);

    // Fetch average ratings efficiently from DB instead of fetching all review objects into memory
    const housingIds = housings.map(h => h.id);
    const reviewsAgg = housingIds.length > 0 ? await this.prisma.housingReview.groupBy({
      by: ['housingId'],
      where: { housingId: { in: housingIds } },
      _avg: { rating: true },
    }) : [];

    const ratingMap = new Map(reviewsAgg.map(agg => [agg.housingId, agg._avg.rating]));

    // Append average rating to each housing
    const housingsWithRating = housings.map((h) => ({
      ...h,
      avgRating: ratingMap.has(h.id) && ratingMap.get(h.id) !== null ? Math.round((ratingMap.get(h.id) as number) * 10) / 10 : null,
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
    await this.reputationService.addPoints(userId, 10, 'Review added');

    // Ratings feed avgRating, deal scores and the area rollups.
    this.invalidateHousingDerived();

    return review;
  }

  async saveHousing(userId: string, housingId: string) {
    const housing = await this.prisma.housing.findUnique({ where: { id: housingId } });
    if (!housing) throw new NotFoundException('Housing not found');

    // Toggle save
    const existing = await this.prisma.savedHousing.findUnique({
      where: { userId_housingId: { userId, housingId } },
    });

    // Either direction moves `_count.savedBy`, which is a ranking signal in the
    // cached recommendation candidate pool. Nothing else derived from housing
    // changes, so only that one key is dropped.
    if (existing) {
      await this.prisma.savedHousing.delete({
        where: { id: existing.id },
      });
      this.cache.invalidatePatternAsync(CacheKeys.housingCandidates(housing.city));
      return { saved: false, message: 'Housing unsaved' };
    }

    await this.prisma.savedHousing.create({
      data: { userId, housingId },
    });

    this.cache.invalidatePatternAsync(CacheKeys.housingCandidates(housing.city));

    return { saved: true, message: 'Housing saved' };
  }

  async getSavedHousings(userId: string) {
    const saved = await this.prisma.savedHousing.findMany({
      where: { userId },
      include: {
        housing: {
          include: {
            _count: { select: { reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const housingIds = saved.map(s => s.housingId);
    const reviewsAgg = housingIds.length > 0 ? await this.prisma.housingReview.groupBy({
      by: ['housingId'],
      where: { housingId: { in: housingIds } },
      _avg: { rating: true },
    }) : [];

    const ratingMap = new Map(reviewsAgg.map(agg => [agg.housingId, agg._avg.rating]));

    return saved.map((s) => ({
      ...s.housing,
      avgRating: ratingMap.has(s.housingId) && ratingMap.get(s.housingId) !== null ? Math.round((ratingMap.get(s.housingId) as number) * 10) / 10 : null,
      savedAt: s.createdAt,
    }));
  }
}
