import { Injectable } from '@nestjs/common';
import { RecommendationEngine } from './engines/recommendation.engine';
import { PriceIntelligenceEngine } from './engines/price-intelligence.engine';
import { SmartMatchEngine } from './engines/smart-match.engine';
import { ChatbotEngine } from './engines/chatbot.engine';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private recommendation: RecommendationEngine,
    private priceIntelligence: PriceIntelligenceEngine,
    private smartMatch: SmartMatchEngine,
    private chatbot: ChatbotEngine,
    private prisma: PrismaService,
  ) {}

  // ════════════ RECOMMENDATIONS ════════════

  async getHousingRecommendations(userId: string, limit?: number) {
    return this.recommendation.getRecommendations(userId, limit);
  }

  async getSimilarHousings(housingId: string, limit?: number) {
    return this.recommendation.getSimilar(housingId, limit);
  }

  // ════════════ PRICE INTELLIGENCE ════════════

  async getAreaPrices(city?: string) {
    return this.priceIntelligence.getAreaPrices(city);
  }

  async getAreaDetail(area: string, city?: string) {
    return this.priceIntelligence.getAreaDetail(area, city);
  }

  async getDealScore(housingId: string) {
    return this.priceIntelligence.getDealScore(housingId);
  }

  // ════════════ SMART MATCHING ════════════

  async getSmartMatches(userId: string, limit?: number, type?: 'friends' | 'roommates') {
    return this.smartMatch.getMatches(userId, limit, type);
  }

  // ════════════ CHATBOT ════════════

  async chat(userId: string, message: string) {
    return this.chatbot.chat(userId, message);
  }

  async getChatHistory(userId: string) {
    return this.chatbot.getHistory(userId);
  }

  async clearChatHistory(userId: string) {
    return this.chatbot.clearHistory(userId);
  }

  // ════════════ TRACKING ════════════

  async trackHousingView(userId: string, housingId: string, duration?: number) {
    return this.prisma.housingView.create({
      data: { userId, housingId, duration },
    });
  }

  // ════════════ AI INSIGHTS SUMMARY ════════════

  async getInsightsSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, preferredArea: true, budgetMax: true },
    });

    const city = user?.city || 'Pune';

    const [
      totalListings,
      avgRent,
      topRecommendations,
      areaBreakdown,
    ] = await Promise.all([
      this.prisma.housing.count({ where: { city } }),
      this.prisma.housing.aggregate({ _avg: { rent: true }, where: { city } }),
      this.getHousingRecommendations(userId, 3),
      this.getAreaPrices(city),
    ]);

    return {
      city,
      totalListings,
      avgRent: Math.round(avgRent._avg.rent || 0),
      topRecommendations,
      topAreas: areaBreakdown.areas.slice(0, 5),
      budgetFit: user?.budgetMax
        ? {
            budget: user.budgetMax,
            avgRent: Math.round(avgRent._avg.rent || 0),
            verdict:
              user.budgetMax >= (avgRent._avg.rent || 0)
                ? 'Your budget is above the city average — great!'
                : 'Your budget is below average. Consider shared rooms or outskirt areas.',
          }
        : null,
    };
  }
}
