import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SmartMatchEngine {
  constructor(private prisma: PrismaService) {}

  /**
   * Find compatible people using weighted multi-signal scoring
   */
  async getMatches(userId: string, limit = 10, type: 'friends' | 'roommates' = 'friends') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return [];

    // Get candidate users in the same city
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        isOnboarded: true,
        city: user.city || 'Pune',
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        gender: true,
        interests: true,
        foodPreference: true,
        workSchedule: true,
        lifestyle: true,
        smoking: true,
        drinking: true,
        petFriendly: true,
        ageRange: true,
        hometown: true,
        university: true,
        company: true,
        courseOrDept: true,
        languages: true,
        preferredArea: true,
        bio: true,
        _count: { select: { posts: true, housingReviews: true } },
      },
      take: 100,
    });

    const scored = candidates.map((c) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Lifestyle compatibility (0.25)
      if (user.lifestyle && c.lifestyle) {
        if (user.lifestyle === c.lifestyle) {
          score += 0.25;
          reasons.push(`Both ${c.lifestyle.replace('_', ' ')}s`);
        } else {
          score += 0.05;
        }
      }
      if (user.workSchedule && c.workSchedule && user.workSchedule === c.workSchedule) {
        score += 0.05;
        reasons.push(`Same work schedule`);
      }

      // 2. Interest overlap (0.20)
      if (user.interests?.length && c.interests?.length) {
        const userSet = new Set(user.interests.map((i) => i.toLowerCase()));
        const overlap = c.interests.filter((i) => userSet.has(i.toLowerCase()));
        const overlapRatio = overlap.length / Math.max(userSet.size, 1);
        score += overlapRatio * 0.20;
        if (overlap.length > 0) {
          reasons.push(`Shared interests: ${overlap.slice(0, 2).join(', ')}`);
        }
      }

      // 3. Food preference (0.15)
      if (user.foodPreference && c.foodPreference) {
        if (user.foodPreference === c.foodPreference) {
          score += 0.15;
          reasons.push(`Both ${c.foodPreference}`);
        } else {
          score += 0.03;
        }
      }

      // 4. Habit compatibility (0.15) — especially for roommates
      if (type === 'roommates') {
        const habitMatch =
          (user.smoking === c.smoking ? 1 : 0) +
          (user.drinking === c.drinking ? 1 : 0) +
          (user.petFriendly === c.petFriendly ? 1 : 0);
        score += (habitMatch / 3) * 0.15;
        if (habitMatch === 3) reasons.push('Compatible habits');
      }

      // 5. Location proximity (0.10)
      if (user.preferredArea && c.preferredArea) {
        const userAreas = user.preferredArea.toLowerCase().split(',').map((a) => a.trim());
        const candAreas = c.preferredArea.toLowerCase().split(',').map((a) => a.trim());
        if (userAreas.some((a) => candAreas.includes(a))) {
          score += 0.10;
          reasons.push('Same area preference');
        }
      }

      // 6. Background match (0.10)
      if (user.university && c.university && user.university === c.university) {
        score += 0.05;
        reasons.push(`Same university`);
      }
      if (user.hometown && c.hometown && user.hometown.toLowerCase() === c.hometown.toLowerCase()) {
        score += 0.03;
        reasons.push(`Same hometown`);
      }
      if (user.ageRange && c.ageRange && user.ageRange === c.ageRange) {
        score += 0.02;
      }

      // 7. Language overlap (0.05)
      if (user.languages?.length && c.languages?.length) {
        const langSet = new Set(user.languages.map((l) => l.toLowerCase()));
        const langOverlap = c.languages.filter((l) => langSet.has(l.toLowerCase()));
        if (langOverlap.length > 0) {
          score += 0.05;
          reasons.push(`Speaks ${langOverlap[0]}`);
        }
      }

      return {
        ...c,
        compatibilityScore: Math.round(score * 100),
        matchReasons: reasons.slice(0, 3),
      };
    });

    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return scored.slice(0, limit);
  }
}
