import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ChatbotEngine {
  private client: OpenAI;
  private model: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.client = new OpenAI({
      apiKey: this.config.get('CEREBRAS_API_KEY'),
      baseURL: this.config.get('CEREBRAS_BASE_URL') || 'https://api.cerebras.ai/v1',
    });
    this.model = this.config.get('CEREBRAS_MODEL') || 'llama3.1-8b';
  }

  /**
   * Process a user chat message and generate an AI response
   */
  async chat(userId: string, userMessage: string): Promise<{
    reply: string;
    actions?: any[];
    metadata?: any;
  }> {
    // 1. Get user context
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        role: true,
        gender: true,
        city: true,
        preferredArea: true,
        budgetMin: true,
        budgetMax: true,
        interests: true,
        foodPreference: true,
        lifestyle: true,
        university: true,
        company: true,
      },
    });

    // 2. Get platform context (recent data)
    const [housingStats, communityCount, recentListings] = await Promise.all([
      this.prisma.housing.aggregate({
        _avg: { rent: true },
        _count: true,
        _min: { rent: true },
        _max: { rent: true },
        where: { city: user?.city || 'Pune' },
      }),
      this.prisma.community.count({ where: { city: user?.city || 'Pune' } }),
      this.prisma.housing.findMany({
        where: { city: user?.city || 'Pune' },
        select: { title: true, area: true, rent: true, type: true, amenities: true, isWomenFriendly: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // 3. Get area-wise pricing
    const cityPattern = `%${user?.city || 'Pune'}%`;
    const areaStats = await this.prisma.$queryRaw<any[]>(
      require('@prisma/client').Prisma.sql`
        SELECT area, 
               ROUND(AVG(rent)) as avg_rent, 
               COUNT(*)::int as listing_count,
               MIN(rent) as min_rent,
               MAX(rent) as max_rent
        FROM housings 
        WHERE LOWER(city) LIKE LOWER(${cityPattern})
        GROUP BY area 
        ORDER BY COUNT(*) DESC 
        LIMIT 10
      `
    ).catch(() => []);

    // 4. Get conversation history
    const history = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    // 5. Build system prompt
    const systemPrompt = this.buildSystemPrompt(user, {
      housingStats,
      communityCount,
      recentListings,
      areaStats,
    });

    // 6. Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // 7. Call LLM
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const reply = completion.choices[0]?.message?.content || 'I apologize, I could not process your request. Please try again.';

      // 8. Save conversation
      await this.prisma.chatMessage.createMany({
        data: [
          { userId, role: 'user', content: userMessage },
          { userId, role: 'assistant', content: reply },
        ],
      });

      return { reply };
    } catch (error: any) {
      console.error('Cerebras API Error:', error?.message);

      // Save user message even on error
      await this.prisma.chatMessage.create({
        data: { userId, role: 'user', content: userMessage },
      });

      return {
        reply: `I'm having trouble connecting to my AI engine right now. Here's what I can tell you based on our data:\n\n` +
          `📊 **${user?.city || 'Pune'} Stats:**\n` +
          `- ${housingStats._count} housing listings available\n` +
          `- Average rent: ₹${Math.round(housingStats._avg.rent || 0).toLocaleString()}/month\n` +
          `- Range: ₹${housingStats._min.rent?.toLocaleString()} – ₹${housingStats._max.rent?.toLocaleString()}\n` +
          `- ${communityCount} communities to join\n\n` +
          `Please try again in a moment!`,
      };
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  /**
   * Clear conversation history
   */
  async clearHistory(userId: string) {
    await this.prisma.chatMessage.deleteMany({ where: { userId } });
    return { cleared: true };
  }

  private buildSystemPrompt(user: any, platformData: any): string {
    const areaInfo = platformData.areaStats?.length
      ? platformData.areaStats
        .map((a: any) => `  - ${a.area}: avg ₹${a.avg_rent}/mo (${a.listing_count} listings, ₹${a.min_rent}–₹${a.max_rent})`)
        .join('\n')
      : '  No area data available yet.';

    const recentListingsInfo = platformData.recentListings?.length
      ? platformData.recentListings
        .slice(0, 5)
        .map((l: any) => `  - "${l.title}" in ${l.area} — ₹${l.rent}/mo (${l.type}${l.isWomenFriendly ? ', Women-Friendly' : ''})`)
        .join('\n')
      : '  No listings yet.';

    return `You are LocalLoop AI, a friendly and knowledgeable relocation assistant for people moving to Indian cities. You help users find housing, roommates, communities, and settle into new cities.

## User Profile
- Name: ${user?.name || 'User'}
- Role: ${user?.role || 'Unknown'}
- City: ${user?.city || 'Pune'}
- Preferred Area: ${user?.preferredArea || 'Not set'}
- Budget: ₹${user?.budgetMin || '?'} – ₹${user?.budgetMax || '?'}/month
- Gender: ${user?.gender || 'Not specified'}
- Interests: ${user?.interests?.join(', ') || 'Not set'}
- Food: ${user?.foodPreference || 'Not set'}
- Lifestyle: ${user?.lifestyle || 'Not set'}
- University: ${user?.university || 'Not set'}
- Company: ${user?.company || 'Not set'}

## Platform Data (${user?.city || 'Pune'})
- Total Housing Listings: ${platformData.housingStats._count}
- Average Rent: ₹${Math.round(platformData.housingStats._avg.rent || 0)}/month
- Rent Range: ₹${platformData.housingStats._min.rent || 0} – ₹${platformData.housingStats._max.rent || 0}
- Communities: ${platformData.communityCount}

## Area-wise Pricing
${areaInfo}

## Recent Listings
${recentListingsInfo}

## Instructions
1. Be warm, conversational, and use Indian English naturally (e.g., "PG", "lakh", "auto-rickshaw").
2. When users ask about housing, reference ACTUAL data from the platform above. Quote specific prices and areas.
3. For budget advice, compare their budget against area averages and suggest the best value areas.
4. If asked about safety, mention women-friendly listings and community reviews.
5. Keep responses concise (under 200 words) but informative. Use bullet points and emojis.
6. If you don't have enough data, say so honestly and suggest they explore the Housing or Communities pages.
7. You can suggest they use specific platform features like "Check the Housing page" or "Join the Newcomers community".
8. Format currency as ₹X,XXX (Indian Rupee notation). Never use $ or other currencies.`;
  }
}
