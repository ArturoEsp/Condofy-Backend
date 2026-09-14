import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import 'dotenv/config';
import { ApplicationExceptionFilter } from './core/infrastructure/filters/application-exception.filter';
import { PrismaClientExceptionFilter } from './core/infrastructure/filters/prisma-exception.filter';

process.env.TZ = 'America/Mexico_City';
const DEFAULT_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  app.use(helmet());

  const corsOriginEnv = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validateCustomDecorators: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  app.useGlobalFilters(
    new ApplicationExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  const isProduction =
    configService.get<string>('APP_ENV') === 'production' ||
    configService.get<string>('NODE_ENV') === 'production';

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Condofy API')
      .setDescription('API for managing Condofy applications')
      .setVersion('1.0')
      .addTag('Condofy REST API')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingresa tu JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('access_token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const PORT = configService.get<number>('APP_PORT') || DEFAULT_PORT;

  await app.listen(PORT);

  console.log(`🚀 Server is running on port ${PORT}`);
}
bootstrap();
