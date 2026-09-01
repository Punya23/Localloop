import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const rawConnectionString = process.env.DATABASE_URL;
    if (!rawConnectionString) {
      throw new Error('DATABASE_URL is not set. Make sure backend/.env is present and loaded.');
    }

    // Tune connection pool: limit=5 is right-sized for Render free tier Postgres
    let connectionString = rawConnectionString.trim().replace(/^['"]|['"]$/g, '');
    if (!connectionString.includes('connection_limit')) {
      const sep = connectionString.includes('?') ? '&' : '?';
      connectionString += `${sep}connection_limit=5&pool_timeout=10&connect_timeout=10`;
    }

    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
