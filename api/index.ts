import type { Request, Response } from 'express';
import type { Express } from 'express';
import { createNestApp } from '../src/bootstrap';

let cachedApp: Express | null = null;

async function getApp() {
  if (!cachedApp) {
    const { expressApp } = await createNestApp();
    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}
