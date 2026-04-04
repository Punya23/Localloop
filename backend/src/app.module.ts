import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HousingModule } from './housing/housing.module';
import { CommunitiesModule } from './communities/communities.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { ReputationModule } from './reputation/reputation.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HousingModule,
    CommunitiesModule,
    PostsModule,
    ChatModule,
    ReputationModule,
    EventsModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {}
