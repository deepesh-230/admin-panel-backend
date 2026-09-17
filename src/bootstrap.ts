import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import type { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import { join } from 'path';
import { gzipSync } from 'zlib';
import { AppModule } from './app.module';

function gzipMiddleware(req: Request, res: Response, next: NextFunction) {
  const accept = String(req.headers['accept-encoding'] || '');
  if (!accept.includes('gzip')) {
    next();
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    const str = JSON.stringify(body ?? null);
    if (str.length < 1024) return originalJson(body);
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.removeHeader('Content-Length');
    res.end(gzipSync(str));
    return res;
  }) as typeof res.json;

  next();
}

export async function createNestApp(
  expressApp: Express = express(),
): Promise<{ app: NestExpressApplication; expressApp: Express }> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  app.use(gzipMiddleware);

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
