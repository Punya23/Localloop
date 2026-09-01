import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { XssSanitizationPipe } from './common/pipes/xss-sanitization.pipe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // ── Gzip compression — cuts JSON payload 60-80% ──
  app.use(compression());

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

  // Swagger docs — only in development (saves ~200ms cold start + memory in prod)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LocalLoop API')
      .setDescription('Youth Relocation & Community Infrastructure Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  const server = await app.listen(port);

  // Render's load balancer has a 75s idle timeout — set keepAlive above it to prevent 502s
  server.keepAliveTimeout = 90000;
  server.headersTimeout = 91000;

  console.log(`🚀 LocalLoop API running on port ${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 API Docs at http://localhost:${port}/api/docs`);
  }
}
bootstrap();
