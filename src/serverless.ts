import type { Request, Response } from 'express';
import type { Express } from 'express';
import { createNestApp } from './bootstrap';

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
  // Express Application is a request listener; Express 5 types omit the call signature.
  return (app as unknown as (req: Request, res: Response) => void)(req, res);
}
