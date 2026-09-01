import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

import { XssSanitizationPipe } from './common/pipes/xss-sanitization.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for Prisma
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // CORS
  const allowedOrigins = [
    'https://localloop-red.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (e.g. curl, mobile apps, Swagger)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 86400, // Cache preflight OPTIONS requests for 24 hours
  });

  // Global validation pipes (Order matters!)
  app.useGlobalPipes(
    new XssSanitizationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('LocalLoop API')
    .setDescription('Youth Relocation & Community Infrastructure Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 LocalLoop API running on http://localhost:${port}`);
  console.log(`📚 API Docs at http://localhost:${port}/api/docs`);
}
bootstrap();
