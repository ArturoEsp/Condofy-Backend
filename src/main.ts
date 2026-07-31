import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import 'dotenv/config';
import { ApplicationExceptionFilter } from './core/infrastructure/filters/application-exception.filter';

process.env.TZ = 'America/Mexico_City';
const DEFAULT_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  app.useGlobalFilters(new ApplicationExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Condofy API')
    .setDescription('API for managing Condofy applications')
    .setVersion('1.0')
    .addTag('Condofy REST API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = process.env.APP_PORT || DEFAULT_PORT;

  await app.listen(PORT);

  console.log(`🚀 Server is running on port ${PORT}`);
}
bootstrap();
