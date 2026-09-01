import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatMessageDto, TrackViewDto } from './dto/ai.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // ════════════ RECOMMENDATIONS ════════════

  @Get('recommendations/housing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered housing recommendations' })
  getRecommendations(@Request() req: any, @Query('limit') limit?: string) {
    return this.aiService.getHousingRecommendations(
      req.user.sub,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('recommendations/housing/:id/similar')
  @ApiOperation({ summary: 'Get similar housing listings' })
  getSimilar(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.aiService.getSimilarHousings(id, limit ? parseInt(limit) : 6);
  }

  // ════════════ PRICE INTELLIGENCE ════════════

  @Get('price-intelligence')
  @ApiOperation({ summary: 'Get area-wise price breakdown' })
  getPriceIntelligence(@Query('city') city?: string) {
    return this.aiService.getAreaPrices(city || 'Pune');
  }

  @Get('price-intelligence/area/:area')
  @ApiOperation({ summary: 'Get detailed area price analysis' })
  getAreaDetail(@Param('area') area: string, @Query('city') city?: string) {
    return this.aiService.getAreaDetail(area, city || 'Pune');
  }

  @Get('price-intelligence/deal-score/:housingId')
  @ApiOperation({ summary: 'Get deal score for a housing listing' })
  getDealScore(@Param('housingId') housingId: string) {
    return this.aiService.getDealScore(housingId);
  }

  @Post('predict-rent')
  @ApiOperation({ summary: 'Predict rent using Python ML microservice' })
  async predictRent(@Body() data: any) {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout for cold-start
      const resp = await fetch(`${mlServiceUrl}/predict/rent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`ML API returned ${resp.status}: ${text}`);
      }
      return await resp.json();
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        return { error: 'ML Service is waking up (cold start). Please try again in 30 seconds.' };
      }
      return { error: `ML Service unavailable (${mlServiceUrl}): ${e?.message}` };
    }
  }

  // ════════════ SMART MATCHING ════════════

  @Get('match/people')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-matched compatible people' })
  getMatches(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('type') type?: 'friends' | 'roommates',
  ) {
    return this.aiService.getSmartMatches(
      req.user.sub,
      limit ? parseInt(limit) : 10,
      type || 'friends',
    );
  }

  // ════════════ CHATBOT ════════════

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to AI chatbot' })
  chat(@Request() req: any, @Body() dto: ChatMessageDto) {
    return this.aiService.chat(req.user.sub, dto.message);
  }

  @Get('chat/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI chat history' })
  getChatHistory(@Request() req: any) {
    return this.aiService.getChatHistory(req.user.sub);
  }

  @Delete('chat/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear AI chat history' })
  clearChatHistory(@Request() req: any) {
    return this.aiService.clearChatHistory(req.user.sub);
  }

  // ════════════ TRACKING ════════════

  @Post('track/view')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track housing view for recommendations' })
  trackView(@Request() req: any, @Body() dto: TrackViewDto) {
    return this.aiService.trackHousingView(req.user.sub, dto.housingId, dto.duration);
  }

  // ════════════ INSIGHTS ════════════

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI insights summary' })
  getInsights(@Request() req: any) {
    return this.aiService.getInsightsSummary(req.user.sub);
  }
}
