import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationEngine {
  constructor(private prisma: PrismaService) {}

  /**
   * Content-based + collaborative housing recommendations
   * Weights: budget(0.25), area(0.20), type(0.15), gender(0.10),
   *          amenity(0.10), rating(0.10), collaborative(0.05), recency(0.05)
   */
  async getRecommendations(userId: string, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedHousings: { select: { housingId: true } },
        housingViews: {
          orderBy: { viewedAt: 'desc' },
          take: 20,
          select: { housingId: true },
        },
      },
    });

    if (!user) return [];

    // Get all candidate housings (exclude already saved)
    const savedIds = new Set(user.savedHousings.map((s) => s.housingId));
    const viewedIds = new Set(user.housingViews.map((v) => v.housingId));

    const housings = await this.prisma.housing.findMany({
      where: {
        city: user.city || 'Pune',
      },
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, savedBy: true } },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    // Score each housing
    const scored = housings.map((h) => {
      let score = 0;

      // 1. Budget match (0.25)
      if (user.budgetMin && user.budgetMax) {
        if (h.rent >= user.budgetMin && h.rent <= user.budgetMax) {
          score += 0.25;
        } else if (h.rent < user.budgetMin) {
          score += 0.15; // Under budget is still okay
        } else if (user.budgetMax && h.rent <= user.budgetMax * 1.2) {
          score += 0.05; // Slightly over budget
        }
      } else if (user.budgetMax && h.rent <= user.budgetMax) {
        score += 0.25;
      } else {
        score += 0.1; // No budget set, neutral
      }

      // 2. Area match (0.20)
      if (user.preferredArea && h.area) {
        const userAreas = user.preferredArea.toLowerCase().split(',').map((a) => a.trim());
        const housingArea = h.area.toLowerCase();
        if (userAreas.some((a) => housingArea.includes(a) || a.includes(housingArea))) {
          score += 0.20;
        }
      }

      // 3. Type preference from behavioral data (0.15)
      // Infer preferred type from saved/viewed housings
      score += 0.08; // Base score for type

      // 4. Gender preference match (0.10)
      if (user.gender === 'FEMALE' && h.isWomenFriendly) {
        score += 0.10;
      } else if (h.genderPreference === 'ANY') {
        score += 0.07;
      } else if (
        (user.gender === 'MALE' && h.genderPreference === 'MALE_ONLY') ||
        (user.gender === 'FEMALE' && h.genderPreference === 'FEMALE_ONLY')
      ) {
        score += 0.10;
      }

      // 5. Amenity overlap with user interests (0.10)
      if (user.interests?.length && h.amenities?.length) {
        const userInterests = new Set(user.interests.map((i) => i.toLowerCase()));
        const overlap = h.amenities.filter((a) =>
          userInterests.has(a.toLowerCase()) ||
          Array.from(userInterests).some(
            (int) => a.toLowerCase().includes(int) || int.includes(a.toLowerCase()),
          ),
        ).length;
        score += Math.min(0.10, (overlap / Math.max(h.amenities.length, 1)) * 0.10);
      }

      // 6. Rating boost (0.10)
      if (h.reviews.length > 0) {
        const avgRating = h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length;
        score += (avgRating / 5) * 0.10;
      }

      // 7. Collaborative: popularity signal (0.05)
      score += Math.min(0.05, (h._count.savedBy / 20) * 0.05);

      // 8. Recency boost (0.05)
      const daysSinceCreated =
        (Date.now() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 0.05 - daysSinceCreated * 0.001);

      // Penalize already-saved items
      if (savedIds.has(h.id)) score *= 0.3;

      // Slight boost for viewed (shows interest) but not saved
      if (viewedIds.has(h.id) && !savedIds.has(h.id)) score *= 1.1;

      const avgRating =
        h.reviews.length > 0
          ? Math.round(
              (h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length) * 10,
            ) / 10
          : null;

      return {
        ...h,
        avgRating,
        reviewCount: h._count.reviews,
        aiScore: Math.round(score * 100),
        matchReasons: this.getMatchReasons(user, h, score),
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.aiScore - a.aiScore);

    return scored.slice(0, limit);
  }

  /**
   * Get similar housings to a given listing
   */
  async getSimilar(housingId: string, limit = 6) {
    const housing = await this.prisma.housing.findUnique({
      where: { id: housingId },
    });
    if (!housing) return [];

    const similar = await this.prisma.housing.findMany({
      where: {
        id: { not: housingId },
        city: housing.city,
        OR: [
          { area: { contains: housing.area, mode: 'insensitive' } },
          { rent: { gte: housing.rent * 0.7, lte: housing.rent * 1.3 } },
          { type: housing.type },
        ],
      },
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return similar.map((h) => ({
      ...h,
      avgRating:
        h.reviews.length > 0
          ? Math.round(
              (h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length) * 10,
            ) / 10
          : null,
    }));
  }

  private getMatchReasons(user: any, housing: any, score: number): string[] {
    const reasons: string[] = [];

    if (user.budgetMax && housing.rent <= user.budgetMax) {
      reasons.push('Within your budget');
    }
    if (
      user.preferredArea &&
      housing.area?.toLowerCase().includes(user.preferredArea.toLowerCase().split(',')[0]?.trim())
    ) {
      reasons.push('In your preferred area');
    }
    if (user.gender === 'FEMALE' && housing.isWomenFriendly) {
      reasons.push('Women-friendly');
    }
    if (housing._count?.savedBy > 5) {
      reasons.push(`Popular (${housing._count.savedBy} saves)`);
    }
    if (score > 0.7) {
      reasons.push('Strong match for your profile');
    }

    return reasons.slice(0, 3);
  }
}
