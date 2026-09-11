import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import type { Express } from 'express';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

export async function createNestApp(
  expressApp: Express = express(),
): Promise<{ app: NestExpressApplication; expressApp: Express }> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return { app, expressApp };
}
