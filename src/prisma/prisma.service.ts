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
        await this.ensureCmsPages();
        await this.ensureSystemSettingTable();
        await this.ensurePaymentPlanTable();
        await this.ensureBecomeTables();
        await this.ensureBusinessVerificationColumns();
        await this.ensureHomeBannerTable();
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

  /** Ensures About / Privacy / Terms pages exist for the mobile Settings tab. */
  private async ensureCmsPages() {
    const defaults = [
      {
        slug: 'about',
        title: 'About Us',
        content:
          'Divyaang Disha connects persons with disabilities to verified service providers, resources, and community support across India.',
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content:
          'We collect only the information needed to operate your account and improve our services. We do not sell your personal data.',
      },
      {
        slug: 'terms',
        title: 'Terms and Conditions',
        content:
          'By using Divyaang Disha you agree to use the platform respectfully and to provide accurate information in listings and enquiries.',
      },
    ];

    try {
      let added = 0;
      for (const page of defaults) {
        const existing = await this.cmsPage.findUnique({ where: { slug: page.slug } });
        if (existing) continue;
        await this.cmsPage.create({ data: { ...page, isActive: true } });
        added += 1;
      }
      if (added > 0) this.logger.log(`Ensured CMS pages (${added} added)`);
    } catch (error) {
      this.logger.warn(
        `Could not ensure CMS pages: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureSystemSettingTable() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SystemSetting" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "label" TEXT,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure SystemSetting table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensurePaymentPlanTable() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "PaymentPlanDurationUnit" AS ENUM ('MONTH', 'YEAR');
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
      `);
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PaymentPlan" (
          "id" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "amount" DECIMAL(12,2) NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'INR',
          "description" TEXT,
          "durationValue" INTEGER NOT NULL DEFAULT 1,
          "durationUnit" "PaymentPlanDurationUnit" NOT NULL DEFAULT 'YEAR',
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `ALTER TABLE "PaymentPlan" ADD COLUMN IF NOT EXISTS "durationValue" INTEGER NOT NULL DEFAULT 1`,
      );
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "PaymentPlan"
            ADD COLUMN "durationUnit" "PaymentPlanDurationUnit" NOT NULL DEFAULT 'YEAR';
        EXCEPTION
          WHEN duplicate_column THEN NULL;
        END $$;
      `);
      // Migrate legacy durationDays → month/year, then drop days column
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'PaymentPlan' AND column_name = 'durationDays'
          ) THEN
            UPDATE "PaymentPlan"
            SET
              "durationValue" = CASE
                WHEN "durationDays" >= 365 AND MOD("durationDays", 365) = 0
                  THEN GREATEST(1, "durationDays" / 365)
                WHEN "durationDays" >= 30
                  THEN GREATEST(1, ROUND("durationDays" / 30.0)::int)
                ELSE 1
              END,
              "durationUnit" = CASE
                WHEN "durationDays" >= 365 AND MOD("durationDays", 365) = 0
                  THEN 'YEAR'::"PaymentPlanDurationUnit"
                ELSE 'MONTH'::"PaymentPlanDurationUnit"
              END;
            ALTER TABLE "PaymentPlan" DROP COLUMN "durationDays";
          END IF;
        END $$;
      `);
      await this.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "PaymentPlan_code_key" ON "PaymentPlan"("code")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "PaymentPlan_isActive_idx" ON "PaymentPlan"("isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "PaymentPlan_sortOrder_idx" ON "PaymentPlan"("sortOrder")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure PaymentPlan table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureBecomeTables() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "BecomeTarget" AS ENUM ('STATE_ADMIN', 'VOLUNTEER', 'PROVIDER_ADMIN');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      // Migrate legacy enum value if the type already existed with SERVICE_PROVIDER
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'BecomeTarget' AND e.enumlabel = 'SERVICE_PROVIDER'
          ) AND NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'BecomeTarget' AND e.enumlabel = 'PROVIDER_ADMIN'
          ) THEN
            ALTER TYPE "BecomeTarget" RENAME VALUE 'SERVICE_PROVIDER' TO 'PROVIDER_ADMIN';
          END IF;
        EXCEPTION WHEN others THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "BecomeQuestionType" AS ENUM ('TEXT', 'SINGLE_CHOICE');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "BecomeApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BecomeQuestion" (
          "id" TEXT NOT NULL,
          "target" "BecomeTarget" NOT NULL,
          "prompt" TEXT NOT NULL,
          "type" "BecomeQuestionType" NOT NULL DEFAULT 'TEXT',
          "options" JSONB,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isRequired" BOOLEAN NOT NULL DEFAULT true,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BecomeQuestion_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeQuestion_target_isActive_idx" ON "BecomeQuestion"("target", "isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeQuestion_sortOrder_idx" ON "BecomeQuestion"("sortOrder")`,
      );

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BecomeApplication" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "target" "BecomeTarget" NOT NULL,
          "status" "BecomeApplicationStatus" NOT NULL DEFAULT 'PENDING',
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "adminNote" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BecomeApplication_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeApplication_target_idx" ON "BecomeApplication"("target")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeApplication_status_idx" ON "BecomeApplication"("status")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeApplication_email_idx" ON "BecomeApplication"("email")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeApplication_userId_idx" ON "BecomeApplication"("userId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeApplication_createdAt_idx" ON "BecomeApplication"("createdAt")`,
      );

      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BecomeAnswer" (
          "id" TEXT NOT NULL,
          "applicationId" TEXT NOT NULL,
          "questionId" TEXT,
          "questionPrompt" TEXT NOT NULL,
          "questionType" "BecomeQuestionType" NOT NULL,
          "answerText" TEXT NOT NULL,
          "selectedOption" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BecomeAnswer_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeAnswer_applicationId_idx" ON "BecomeAnswer"("applicationId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "BecomeAnswer_questionId_idx" ON "BecomeAnswer"("questionId")`,
      );

      // FKs (ignore if already exist)
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "BecomeApplication"
            ADD CONSTRAINT "BecomeApplication_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "BecomeAnswer"
            ADD CONSTRAINT "BecomeAnswer_applicationId_fkey"
            FOREIGN KEY ("applicationId") REFERENCES "BecomeApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "BecomeAnswer"
            ADD CONSTRAINT "BecomeAnswer_questionId_fkey"
            FOREIGN KEY ("questionId") REFERENCES "BecomeQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
    } catch (error) {
      this.logger.warn(
        `Could not ensure Become tables: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureBusinessVerificationColumns() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "BusinessVerificationStatus" AS ENUM (
            'NOT_INITIATED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'
          );
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider"
          ADD COLUMN IF NOT EXISTS "businessVerificationStatus" "BusinessVerificationStatus"
          NOT NULL DEFAULT 'NOT_INITIATED'
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "mcaId" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "din" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "gstin" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "nmcId" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "panId" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "verificationSubmittedAt" TIMESTAMP(3)
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "ServiceProvider" ADD COLUMN IF NOT EXISTS "verificationNote" TEXT
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ServiceProvider_businessVerificationStatus_idx"
        ON "ServiceProvider"("businessVerificationStatus")
      `);
    } catch (error) {
      this.logger.warn(
        `Could not ensure business verification columns: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureHomeBannerTable() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "HomeBanner" (
          "id" TEXT NOT NULL,
          "title" TEXT,
          "image" TEXT NOT NULL,
          "url" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HomeBanner_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_isActive_idx" ON "HomeBanner"("isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_sortOrder_idx" ON "HomeBanner"("sortOrder")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure HomeBanner table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
