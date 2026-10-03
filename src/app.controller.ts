import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Liveness — no DB hit */
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /** Performance probe — measures API + database round-trip latency */
  @Public()
  @Get('health/perf')
  async healthPerf(@Res({ passthrough: true }) res: Response) {
    const data = await this.appService.getHealth();
    if (data.status === 'down') {
      res.status(503);
    } else if (data.status === 'degraded') {
      res.status(200);
    }
    return {
      success: data.status !== 'down',
      message:
        data.status === 'ok'
          ? 'Healthy'
          : data.status === 'degraded'
            ? 'Degraded — database is slow'
            : 'Unhealthy — database unreachable',
      data,
    };
  }
}
