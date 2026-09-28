import { ConfigService } from '@nestjs/config';

const DEV_FALLBACK = 'dev-access-secret';

/**
 * Resolve JWT access secret. In production, missing secret fails closed
 * (no hardcoded fallback).
 */
export function resolveJwtAccessSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_ACCESS_SECRET')?.trim();
  if (secret) return secret;

  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production';

  if (isProd) {
    throw new Error(
      'JWT_ACCESS_SECRET must be set in production. Refusing to start with a default secret.',
    );
  }

  return DEV_FALLBACK;
}
