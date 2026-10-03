import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export type HealthCheckStatus = 'ok' | 'degraded' | 'down';

@Injectable()
export class AppService {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  private dbRegionHint(): string | null {
    const url = process.env.DATABASE_URL || '';
    const match = url.match(/aws-0-([a-z0-9-]+)\.pooler\.supabase\.com/i)
      || url.match(/db\.[^.]+\.supabase\.co/i);
    if (!match) return null;
    if (match[1]) return match[1];
    // direct host — region not in hostname; still useful
    return match[0];
  }

  async getHealth() {
    const started = Date.now();
    const apiStarted = Date.now();
    const apiMs = Date.now() - apiStarted;

    let dbStatus: HealthCheckStatus = 'down';
    let dbMs: number | null = null;
    let dbError: string | undefined;

    const dbStarted = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbMs = Date.now() - dbStarted;
      // Soft thresholds for India ↔ remote DB expectations
      dbStatus = dbMs > 2000 ? 'degraded' : 'ok';
    } catch (err) {
      dbMs = Date.now() - dbStarted;
      dbStatus = 'down';
      dbError = err instanceof Error ? err.message : 'Database unreachable';
    }

    const totalMs = Date.now() - started;
    const status: HealthCheckStatus =
      dbStatus === 'down' ? 'down' : dbStatus === 'degraded' ? 'degraded' : 'ok';

    return {
      status,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
      totalMs,
      region: this.dbRegionHint(),
      timestamp: new Date().toISOString(),
      checks: {
        api: { status: 'ok' as const, latencyMs: apiMs },
        database: {
          status: dbStatus,
          latencyMs: dbMs,
          ...(dbError ? { error: dbError } : {}),
        },
      },
    };
  }
}
