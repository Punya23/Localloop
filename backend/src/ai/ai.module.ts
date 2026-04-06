import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RecommendationEngine } from './engines/recommendation.engine';
import { PriceIntelligenceEngine } from './engines/price-intelligence.engine';
import { SmartMatchEngine } from './engines/smart-match.engine';
import { ChatbotEngine } from './engines/chatbot.engine';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    RecommendationEngine,
    PriceIntelligenceEngine,
    SmartMatchEngine,
    ChatbotEngine,
  ],
  exports: [AiService],
})
export class AiModule {}
