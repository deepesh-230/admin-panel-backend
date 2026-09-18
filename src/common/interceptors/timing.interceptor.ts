import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method?: string; originalUrl?: string; url?: string }>();
    const start = Date.now();
    const path = `${req.method} ${req.originalUrl || req.url}`;
    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          if (ms >= 200) this.logger.log(`${path} ${ms}ms`);
        },
        error: (err: { message?: string }) => {
          this.logger.warn(`${path} ${Date.now() - start}ms FAILED ${err?.message || err}`);
        },
      }),
    );
  }
}
