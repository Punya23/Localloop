import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../common/cache/cache.service';
import { CacheKeys } from '../common/cache/cache.keys';

@Injectable()
export class ReputationService {
  constructor(private prisma: PrismaService, private cache: CacheService) {}

  private getLevel(points: number): string {
    if (points >= 1000) return 'LOCAL_MENTOR';
    if (points >= 500) return 'CITY_NAVIGATOR';
    if (points >= 200) return 'SETTLER';
    if (points >= 50) return 'GUIDE';
    return 'EXPLORER';
  }

  async getUserReputation(userId: string) {
    const reputation = await this.prisma.reputation.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isMentor: true,
          },
        },
      },
    });

    if (!reputation) {
      throw new NotFoundException('Reputation not found');
    }

    // Check and update level if needed
    const expectedLevel = this.getLevel(reputation.points);
    if (reputation.level !== expectedLevel) {
      await this.prisma.reputation.update({
        where: { userId },
        data: { level: expectedLevel as any },
      });
      reputation.level = expectedLevel as any;
    }

    return {
      ...reputation,
      nextLevel: this.getNextLevel(reputation.points),
    };
  }

  /**
   * Ranking board. Deliberately *not* invalidated by `addPoints` — points move
   * on almost every post, comment and review, so prefix-busting on every write
   * would keep the hit rate at zero. A 60s-stale board is the right trade.
   */
  async getLeaderboard(city?: string, limit: number = 20) {
    return this.cache.wrap(
      CacheKeys.leaderboardList(city, limit),
      () => this.fetchLeaderboard(city, limit),
      CacheService.TTL.SHORT,
    );
  }

  private async fetchLeaderboard(city?: string, limit: number = 20) {
    const leaderboard = await this.prisma.reputation.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            city: true,
            role: true,
            isMentor: true,
          },
        },
      },
      ...(city && {
        where: {
          user: {
            city: { contains: city, mode: 'insensitive' as any },
          },
        },
      }),
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }

  async addPoints(userId: string, points: number, reason: string) {
    const reputation = await this.prisma.reputation.upsert({
      where: { userId },
      update: {
        points: { increment: points },
      },
      create: {
        userId,
        points,
        level: 'EXPLORER',
      },
    });

    // Update level
    const newLevel = this.getLevel(reputation.points);
    if (reputation.level !== newLevel) {
      await this.prisma.reputation.update({
        where: { userId },
        data: { level: newLevel as any },
      });
    }

    return reputation;
  }

  private getNextLevel(points: number) {
    if (points >= 1000) return { level: 'LOCAL_MENTOR', pointsNeeded: 0, current: points };
    if (points >= 500) return { level: 'LOCAL_MENTOR', pointsNeeded: 1000 - points, current: points };
    if (points >= 200) return { level: 'CITY_NAVIGATOR', pointsNeeded: 500 - points, current: points };
    if (points >= 50) return { level: 'SETTLER', pointsNeeded: 200 - points, current: points };
    return { level: 'GUIDE', pointsNeeded: 50 - points, current: points };
  }
}
