import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_CONNECT_RETRIES = 6;
const CONNECT_RETRY_DELAY_MS = 5000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt++) {
      try {
        await this.$connect();
        if (attempt > 1) {
          this.logger.log(`Database connected on attempt ${attempt}`);
        }
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const retryable = message.includes("Can't reach database server") || message.includes('P1001');

        if (!retryable || attempt === MAX_CONNECT_RETRIES) {
          this.logger.error(
            'Database connection failed. If using Neon, wake the project in the Neon console or use the pooled connection string.',
          );
          throw error;
        }

        this.logger.warn(
          `Database unreachable (attempt ${attempt}/${MAX_CONNECT_RETRIES}), retrying in ${CONNECT_RETRY_DELAY_MS / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, CONNECT_RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
