import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INDIA_STATES } from '../states/india-states';

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
        await this.ensureSocialSettingTable();
        await this.ensureIndiaStates();
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

  /** Creates SocialSetting if missing (covers environments where db push hasn't been run yet). */
  private async ensureSocialSettingTable() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SocialSetting" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SocialSetting_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SocialSetting_isActive_idx" ON "SocialSetting"("isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SocialSetting_name_idx" ON "SocialSetting"("name")`,
      );

      const count = await this.socialSetting.count();
      if (count === 0) {
        const now = new Date();
        await this.socialSetting.createMany({
          data: [
            {
              id: 'seed-social-whatsapp',
              name: 'WhatsApp',
              code: 'https://wa.me/918895199939',
              isActive: true,
              createdAt: new Date('2024-08-12'),
              updatedAt: now,
            },
            {
              id: 'seed-social-facebook',
              name: 'facebook',
              code: 'divyaangdisha.com',
              isActive: true,
              createdAt: new Date('2021-05-01'),
              updatedAt: now,
            },
            {
              id: 'seed-social-twitter',
              name: 'Twitter',
              code: 'divyaangdisha.com',
              isActive: true,
              createdAt: new Date('2021-04-18'),
              updatedAt: now,
            },
            {
              id: 'seed-social-instagram',
              name: 'instagram',
              code: 'divyaangdisha.com',
              isActive: true,
              createdAt: new Date('2021-07-19'),
              updatedAt: now,
            },
          ],
          skipDuplicates: true,
        });
        this.logger.log('SocialSetting table ready (seeded defaults)');
      }
    } catch (error) {
      this.logger.warn(
        `Could not ensure SocialSetting table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Upserts all Indian states/UTs so admin dropdowns are complete. */
  private async ensureIndiaStates() {
    try {
      const existing = await this.state.findMany({ select: { name: true } });
      const existingNames = new Set(existing.map((s) => s.name));
      const missing = INDIA_STATES.filter((s) => !existingNames.has(s.name));
      if (!missing.length) return;

      for (const state of missing) {
        await this.state.upsert({
          where: { name: state.name },
          update: { code: state.code, isActive: true },
          create: { name: state.name, code: state.code, isActive: true },
        });
      }
      this.logger.log(`Ensured Indian states (${missing.length} added)`);
    } catch (error) {
      this.logger.warn(
        `Could not ensure Indian states: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
