import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { CacheKeys } from '../../common/cache/cache.keys';

@Injectable()
export class PriceIntelligenceEngine {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  /**
   * Area-wise price breakdown for a city.
   *
   * This scans every listing in the city and rolls it up in memory, so it is by
   * far the heaviest read in the app — and its output only changes when a
   * listing is created or edited. Cached for 15 minutes and busted by
   * `HousingService.invalidateHousingDerived()`.
   */
  async getAreaPrices(city = 'Pune') {
    return this.cache.wrap(
      CacheKeys.areaPrices(city),
      () => this.computeAreaPrices(city),
      CacheService.TTL.LONG,
    );
  }

  private async computeAreaPrices(city: string) {
    const housings = await this.prisma.housing.findMany({
      where: { city: { contains: city, mode: 'insensitive' } },
      select: {
        area: true,
        rent: true,
        type: true,
        createdAt: true,
      },
    });

    // Group by area
    const areaMap = new Map<string, typeof housings>();
    for (const h of housings) {
      const area = h.area?.trim() || 'Unknown';
      if (!areaMap.has(area)) areaMap.set(area, []);
      areaMap.get(area)!.push(h);
    }

    const areas = Array.from(areaMap.entries()).map(([area, listings]) => {
      const rents = listings.map((l) => l.rent).sort((a, b) => a - b);
      const avgRent = Math.round(rents.reduce((s, r) => s + r, 0) / rents.length);
      const medianRent = rents[Math.floor(rents.length / 2)] || 0;

      // By type
      const byType: Record<string, { avg: number; count: number; min: number; max: number }> = {};
      for (const l of listings) {
        const t = l.type || 'UNKNOWN';
        if (!byType[t]) byType[t] = { avg: 0, count: 0, min: Infinity, max: 0 };
        byType[t].count++;
        byType[t].avg += l.rent;
        byType[t].min = Math.min(byType[t].min, l.rent);
        byType[t].max = Math.max(byType[t].max, l.rent);
      }
      for (const t of Object.keys(byType)) {
        byType[t].avg = Math.round(byType[t].avg / byType[t].count);
        if (byType[t].min === Infinity) byType[t].min = 0;
      }

      // Price trend (group by month)
      const trend = this.calculateTrend(listings);

      return {
        area,
        avgRent,
        medianRent,
        minRent: rents[0] || 0,
        maxRent: rents[rents.length - 1] || 0,
        listingCount: listings.length,
        byType,
        trend,
      };
    });

    // Sort by listing count
    areas.sort((a, b) => b.listingCount - a.listingCount);

    // City-wide summary
    const allRents = housings.map((h) => h.rent);
    const cityAvg = allRents.length
      ? Math.round(allRents.reduce((s, r) => s + r, 0) / allRents.length)
      : 0;

    return {
      city,
      totalListings: housings.length,
      cityAvgRent: cityAvg,
      areas,
    };
  }

  /**
   * Deep dive into a single area
   */
  async getAreaDetail(area: string, city = 'Pune') {
    return this.cache.wrap(
      CacheKeys.areaDetail(area, city),
      () => this.computeAreaDetail(area, city),
      CacheService.TTL.LONG,
    );
  }

  private async computeAreaDetail(area: string, city: string) {
    const housings = await this.prisma.housing.findMany({
      where: {
        city: { contains: city, mode: 'insensitive' },
        area: { contains: area, mode: 'insensitive' },
      },
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { savedBy: true, reviews: true } },
      },
      orderBy: { rent: 'asc' },
    });

    const rents = housings.map((h) => h.rent);
    const avgRent = rents.length
      ? Math.round(rents.reduce((s, r) => s + r, 0) / rents.length)
      : 0;

    // Amenity frequency
    const amenityCount: Record<string, number> = {};
    for (const h of housings) {
      for (const a of h.amenities || []) {
        amenityCount[a] = (amenityCount[a] || 0) + 1;
      }
    }
    const topAmenities = Object.entries(amenityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Safety / women-friendly stats
    const womenFriendlyCount = housings.filter((h) => h.isWomenFriendly).length;
    const avgRating = housings
      .filter((h) => h.reviews.length > 0)
      .map((h) => h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length);
    const overallRating =
      avgRating.length > 0
        ? Math.round((avgRating.reduce((s, r) => s + r, 0) / avgRating.length) * 10) / 10
        : null;

    return {
      area,
      city,
      totalListings: housings.length,
      avgRent,
      medianRent: rents[Math.floor(rents.length / 2)] || 0,
      minRent: rents[0] || 0,
      maxRent: rents[rents.length - 1] || 0,
      womenFriendlyPercentage:
        housings.length > 0 ? Math.round((womenFriendlyCount / housings.length) * 100) : 0,
      overallRating,
      topAmenities,
      priceDistribution: this.getPriceDistribution(rents),
      trend: this.calculateTrend(housings),
    };
  }

  /**
   * Deal score for a specific housing
   * Returns how good the deal is compared to area average
   */
  async getDealScore(housingId: string) {
    return this.cache.wrap(
      CacheKeys.dealScore(housingId),
      () => this.computeDealScore(housingId),
      CacheService.TTL.MEDIUM,
    );
  }

  private async computeDealScore(housingId: string) {
    const housing = await this.prisma.housing.findUnique({
      where: { id: housingId },
      include: {
        reviews: { select: { rating: true } },
      },
    });
    if (!housing) return null;

    // Get area average
    const areaAvg = await this.prisma.housing.aggregate({
      _avg: { rent: true },
      _count: true,
      where: {
        city: housing.city,
        area: { contains: housing.area, mode: 'insensitive' },
        type: housing.type,
      },
    });

    const avgRent = areaAvg._avg.rent || housing.rent;
    const priceDiff = ((housing.rent - avgRent) / avgRent) * 100;

    let dealLabel: string;
    let dealColor: string;
    if (priceDiff <= -15) {
      dealLabel = 'Great Deal';
      dealColor = '#34c759';
    } else if (priceDiff <= -5) {
      dealLabel = 'Good Price';
      dealColor = '#30d158';
    } else if (priceDiff <= 5) {
      dealLabel = 'Fair Price';
      dealColor = '#ff9500';
    } else if (priceDiff <= 15) {
      dealLabel = 'Above Average';
      dealColor = '#ff6b35';
    } else {
      dealLabel = 'Premium';
      dealColor = '#ff3b30';
    }

    return {
      housingId,
      rent: housing.rent,
      areaAvgRent: Math.round(avgRent),
      priceDifference: Math.round(priceDiff),
      dealLabel,
      dealColor,
      areaListingCount: areaAvg._count,
      avgRating:
        housing.reviews.length > 0
          ? Math.round(
              (housing.reviews.reduce((s, r) => s + r.rating, 0) / housing.reviews.length) * 10,
            ) / 10
          : null,
    };
  }

  private calculateTrend(listings: { rent: number; createdAt: Date }[]) {
    const monthMap = new Map<string, number[]>();
    for (const l of listings) {
      const month = new Date(l.createdAt).toISOString().slice(0, 7);
      if (!monthMap.has(month)) monthMap.set(month, []);
      monthMap.get(month)!.push(l.rent);
    }

    return Array.from(monthMap.entries())
      .map(([month, rents]) => ({
        month,
        avgRent: Math.round(rents.reduce((s, r) => s + r, 0) / rents.length),
        count: rents.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }

  private getPriceDistribution(rents: number[]) {
    if (rents.length === 0) return [];
    const min = rents[0];
    const max = rents[rents.length - 1];
    const bucketSize = Math.max(Math.ceil((max - min) / 5), 1000);

    const buckets: { range: string; count: number }[] = [];
    for (let start = min; start <= max; start += bucketSize) {
      const end = start + bucketSize;
      const count = rents.filter((r) => r >= start && r < end).length;
      buckets.push({
        range: `₹${(start / 1000).toFixed(0)}k - ₹${(end / 1000).toFixed(0)}k`,
        count,
      });
    }
    return buckets;
  }
}
