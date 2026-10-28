import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import type { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import { join } from 'path';
import { gzipSync } from 'zlib';
import { AppModule } from './app.module';

/** Allow every browser origin. */
function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, Origin, X-Requested-With',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

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
  expressApp.use(corsMiddleware);

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  app.use(gzipMiddleware);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'product/:id', method: RequestMethod.GET }],
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
