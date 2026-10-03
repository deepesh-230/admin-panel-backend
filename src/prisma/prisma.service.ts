import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { INDIA_STATES } from '../states/india-states';

const MAX_CONNECT_RETRIES = 2;
const CONNECT_RETRY_DELAY_MS = 1000;

/** Log every query when true/1/all; otherwise only slow ones. */
function dbLogAllQueries() {
  const v = (process.env.DB_LOG_QUERIES || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'all' || v === 'yes';
}

/** Queries at or above this duration (ms) are always logged. Default 100. */
function dbSlowQueryMs() {
  const n = Number(process.env.DB_LOG_SLOW_MS);
  return Number.isFinite(n) && n >= 0 ? n : 100;
}

function dbLogQueryParams() {
  const v = (process.env.DB_LOG_QUERY_PARAMS || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function shortenSql(sql: string, max = 400) {
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max)}…`;
}

/**
 * Tune DATABASE_URL for Prisma + hosted poolers.
 * Supabase Session pooler (:5432) caps concurrent clients (~15) — exhausting it
 * causes intermittent 500s that the browser often labels as "CORS error".
 * Prefer Transaction pooler (:6543) with pgbouncer=true for the Nest app.
 */
function prismaDatasourceUrl() {
  let url = process.env.DATABASE_URL || '';
  if (!url) return url;

  const isSupabasePooler = /pooler\.supabase\.com/i.test(url);
  const isSessionPort = /:5432(\/|\?|$)/.test(url);
  const isTxnPort = /:6543(\/|\?|$)/.test(url);

  if (isSupabasePooler && isSessionPort) {
    // Prefer transaction mode when still pointing at session port.
    url = url.replace(':5432', ':6543');
  }

  const params = new URLSearchParams(url.includes('?') ? url.slice(url.indexOf('?') + 1) : '');
  const base = url.includes('?') ? url.slice(0, url.indexOf('?')) : url;

  if ((isSupabasePooler && (isTxnPort || isSessionPort)) || /:6543(\/|\?|$)/.test(url)) {
    if (!params.has('pgbouncer')) params.set('pgbouncer', 'true');
  }
  if (!params.has('connection_limit')) {
    // One Prisma client per Nest process; keep pool tiny on shared poolers.
    params.set('connection_limit', isSupabasePooler ? '3' : '5');
  }
  if (!params.has('pool_timeout')) params.set('pool_timeout', '5');
  if (!params.has('connect_timeout')) params.set('connect_timeout', '5');

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private keepAlive?: ReturnType<typeof setInterval>;

  constructor() {
    super({
      datasources: { db: { url: prismaDatasourceUrl() } },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
    this.registerQueryLogger();
  }

  private registerQueryLogger() {
    const logAll = dbLogAllQueries();
    const slowMs = dbSlowQueryMs();
    const withParams = dbLogQueryParams();

    this.$on('query', (e: Prisma.QueryEvent) => {
      const duration = e.duration;
      const isKeepAlive = /^\s*SELECT\s+1\s*$/i.test(e.query);
      if (isKeepAlive && !logAll) return;

      if (!logAll && duration < slowMs) return;

      const sql = shortenSql(e.query);
      const params =
        withParams && e.params && e.params !== '[]' ? ` params=${e.params}` : '';
      const line = `query ${duration}ms — ${sql}${params}`;

      if (duration >= 2000) this.logger.warn(line);
      else this.logger.log(line);
    });
  }

  async onModuleInit() {
    const resolved = prismaDatasourceUrl();
    if (/pooler\.supabase\.com:5432/i.test(process.env.DATABASE_URL || '')) {
      this.logger.warn(
        'DATABASE_URL uses Supabase Session pooler (:5432). Auto-switching Prisma to Transaction pooler (:6543) to avoid EMAXCONNSESSION / intermittent CORS failures.',
      );
    }
    this.logger.log(
      `Prisma datasource: ${resolved.replace(/:[^:@/]+@/, ':***@')}`,
    );
    this.logger.log(
      `DB query log: ${dbLogAllQueries() ? 'all queries' : `slow ≥${dbSlowQueryMs()}ms`} (set DB_LOG_QUERIES=true for all; DB_LOG_SLOW_MS to change threshold)`,
    );

    for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt++) {
      try {
        await this.$connect();
        if (attempt > 1) {
          this.logger.log(`Database connected on attempt ${attempt}`);
        }
        this.startKeepAlive();
        const runEnsure = process.env.RUN_ENSURE_DDL !== 'false';
        if (runEnsure) {
          void this.ensureBootstrapSchema().catch((error) => {
            this.logger.warn(
              `Background schema ensure failed: ${error instanceof Error ? error.message : String(error)}`,
            );
          });
        }
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const retryable =
          message.includes("Can't reach database server") ||
          message.includes('P1001') ||
          message.includes('EMAXCONN') ||
          message.includes('max clients');

        if (!retryable || attempt === MAX_CONNECT_RETRIES) {
          this.logger.error(
            'Database connection failed. For Supabase use the Transaction pooler (port 6543) with pgbouncer=true; avoid Session pooler (:5432) for the Nest app.',
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

  private startKeepAlive() {
    if (this.keepAlive) return;
    // Longer interval + tiny pool: avoid holding Session-pooler slots.
    this.keepAlive = setInterval(() => {
      void this.$queryRaw`SELECT 1`.catch(() => undefined);
    }, 60_000);
    this.keepAlive.unref();
  }

  private async ensureBootstrapSchema() {
    await this.ensureSocialSettingTable();
    await this.ensureIndiaStates();
    await this.ensureCmsPages();
    await this.ensureSystemSettingTable();
    await this.ensurePaymentPlanTable();
    await this.ensurePaymentPayerNoteColumn();
    await this.ensureBecomeTables();
    await this.ensureBusinessVerificationColumns();
    await this.ensureHomeBannerTable();
    await this.ensureEventCoverageColumns();
    await this.ensureUserProfileColumns();
    await this.ensureListFilterIndexes();
    await this.ensureMarketplaceSaleResaleColumns();
    await this.ensureDropCategorySlugs();
    await this.ensureDeviceTokenTable();
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

      await this.state.createMany({
        data: missing.map((state) => ({
          name: state.name,
          code: state.code,
          isActive: true,
        })),
        skipDuplicates: true,
      });
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

  private async ensurePaymentPayerNoteColumn() {
    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "payerNote" TEXT`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure Payment.payerNote column: ${error instanceof Error ? error.message : String(error)}`,
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
        DO $$ BEGIN
          CREATE TYPE "CoverageFlag" AS ENUM ('NATIONAL', 'STATE', 'LOCAL');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "HomeBanner" (
          "id" TEXT NOT NULL,
          "title" TEXT,
          "image" TEXT NOT NULL,
          "url" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "coverageFlag" "CoverageFlag" NOT NULL DEFAULT 'NATIONAL',
          "coverageStateId" TEXT,
          "coverageCity" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HomeBanner_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "HomeBanner"
          ADD COLUMN IF NOT EXISTS "coverageFlag" "CoverageFlag" NOT NULL DEFAULT 'NATIONAL'
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "HomeBanner" ADD COLUMN IF NOT EXISTS "coverageStateId" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "HomeBanner" ADD COLUMN IF NOT EXISTS "coverageCity" TEXT
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "HomeBanner"
            ADD CONSTRAINT "HomeBanner_coverageStateId_fkey"
            FOREIGN KEY ("coverageStateId") REFERENCES "State"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_isActive_idx" ON "HomeBanner"("isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_sortOrder_idx" ON "HomeBanner"("sortOrder")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_coverageFlag_idx" ON "HomeBanner"("coverageFlag")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HomeBanner_coverageStateId_idx" ON "HomeBanner"("coverageStateId")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure HomeBanner table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureEventCoverageColumns() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "CoverageFlag" AS ENUM ('NATIONAL', 'STATE', 'LOCAL');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "Event"
          ADD COLUMN IF NOT EXISTS "coverageFlag" "CoverageFlag" NOT NULL DEFAULT 'NATIONAL'
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverageStateId" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "coverageCity" TEXT
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "Event"
            ADD CONSTRAINT "Event_coverageStateId_fkey"
            FOREIGN KEY ("coverageStateId") REFERENCES "State"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Event_coverageFlag_idx" ON "Event"("coverageFlag")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Event_coverageStateId_idx" ON "Event"("coverageStateId")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure Event coverage columns: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureUserProfileColumns() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "AgeRange" AS ENUM (
            'AGE_5_9',
            'AGE_10_14',
            'AGE_15_19',
            'AGE_20_24',
            'AGE_25_29',
            'AGE_30_40',
            'AGE_40_50',
            'AGE_50_60',
            'AGE_60_PLUS'
          );
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      // Migrate legacy AgeRange values if the old enum still exists in use.
      await this.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            WHERE t.typname = 'AgeRange' AND e.enumlabel = 'UNDER_18'
          ) THEN
            ALTER TABLE "User" ALTER COLUMN "ageRange" DROP DEFAULT;
            ALTER TABLE "User" ALTER COLUMN "ageRange" TYPE TEXT USING "ageRange"::TEXT;
            UPDATE "User" SET "ageRange" = CASE "ageRange"
              WHEN 'UNDER_18' THEN 'AGE_15_19'
              WHEN 'AGE_18_25' THEN 'AGE_20_24'
              WHEN 'AGE_26_40' THEN 'AGE_30_40'
              WHEN 'AGE_41_60' THEN 'AGE_50_60'
              WHEN 'AGE_60_PLUS' THEN 'AGE_60_PLUS'
              ELSE "ageRange"
            END
            WHERE "ageRange" IS NOT NULL;
            DROP TYPE "AgeRange";
            CREATE TYPE "AgeRange" AS ENUM (
              'AGE_5_9',
              'AGE_10_14',
              'AGE_15_19',
              'AGE_20_24',
              'AGE_25_29',
              'AGE_30_40',
              'AGE_40_50',
              'AGE_50_60',
              'AGE_60_PLUS'
            );
            ALTER TABLE "User"
              ALTER COLUMN "ageRange" TYPE "AgeRange"
              USING (
                CASE
                  WHEN "ageRange" IN (
                    'AGE_5_9',
                    'AGE_10_14',
                    'AGE_15_19',
                    'AGE_20_24',
                    'AGE_25_29',
                    'AGE_30_40',
                    'AGE_40_50',
                    'AGE_50_60',
                    'AGE_60_PLUS'
                  ) THEN "ageRange"::"AgeRange"
                  ELSE NULL
                END
              );
          END IF;
        END $$;
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT
      `);
      await this.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ageRange" "AgeRange"
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_ageRange_idx" ON "User"("ageRange")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_city_idx" ON "User"("city")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt")`,
      );
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "UserDisability" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "subcategoryId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserDisability_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "UserDisability"
            ADD CONSTRAINT "UserDisability_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "UserDisability"
            ADD CONSTRAINT "UserDisability_subcategoryId_fkey"
            FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "UserDisability_userId_subcategoryId_key"
        ON "UserDisability"("userId", "subcategoryId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "UserDisability_subcategoryId_idx"
        ON "UserDisability"("subcategoryId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "UserDisability_userId_idx"
        ON "UserDisability"("userId")
      `);
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ServiceProviderSubcategory" (
          "id" TEXT NOT NULL,
          "serviceProviderId" TEXT NOT NULL,
          "subcategoryId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ServiceProviderSubcategory_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "ServiceProviderSubcategory"
            ADD CONSTRAINT "ServiceProviderSubcategory_serviceProviderId_fkey"
            FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "ServiceProviderSubcategory"
            ADD CONSTRAINT "ServiceProviderSubcategory_subcategoryId_fkey"
            FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "ServiceProviderSubcategory_serviceProviderId_subcategoryId_key"
        ON "ServiceProviderSubcategory"("serviceProviderId", "subcategoryId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ServiceProviderSubcategory_subcategoryId_idx"
        ON "ServiceProviderSubcategory"("subcategoryId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ServiceProviderSubcategory_serviceProviderId_idx"
        ON "ServiceProviderSubcategory"("serviceProviderId")
      `);
      await this.$executeRawUnsafe(`
        INSERT INTO "ServiceProviderSubcategory" ("id", "serviceProviderId", "subcategoryId", "createdAt")
        SELECT gen_random_uuid()::text, sp."id", sp."subcategoryId", CURRENT_TIMESTAMP
        FROM "ServiceProvider" sp
        WHERE sp."subcategoryId" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM "ServiceProviderSubcategory" link
            WHERE link."serviceProviderId" = sp."id"
              AND link."subcategoryId" = sp."subcategoryId"
          )
      `);
    } catch (error) {
      this.logger.warn(
        `Could not ensure user profile columns: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureListFilterIndexes() {
    try {
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_stateId_idx" ON "User"("stateId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_isActive_idx" ON "User"("isActive")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "ServiceProvider_createdAt_idx" ON "ServiceProvider"("createdAt")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "ServiceProvider_latitude_longitude_idx" ON "ServiceProvider"("latitude", "longitude")`,
      );
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ServiceProvider_approvalStatus_isActive_stateId_idx"
        ON "ServiceProvider"("approvalStatus", "isActive", "stateId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "ServiceProvider_categoryId_subcategoryId_idx"
        ON "ServiceProvider"("categoryId", "subcategoryId")
      `);
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "User_roleId_stateId_idx" ON "User"("roleId", "stateId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Payment_purpose_status_idx" ON "Payment"("purpose", "status")`,
      );
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "MarketplaceProduct_adminFlag_deletedAt_stateId_idx"
        ON "MarketplaceProduct"("adminFlag", "deletedAt", "stateId")
      `);
      await this.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Enquiry_adminFlag_deletedAt_status_idx"
        ON "Enquiry"("adminFlag", "deletedAt", "status")
      `);
    } catch (error) {
      this.logger.warn(
        `Could not ensure list filter indexes: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureMarketplaceSaleResaleColumns() {
    try {
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "MarketplaceItemCondition" AS ENUM ('NEW', 'USED', 'FREE');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "MarketplaceSaleStatus" AS ENUM ('NEWLY_ADDED', 'PENDING_SALE', 'SOLD');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "condition" "MarketplaceItemCondition"`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "previousOfferPrice" TEXT`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "offerPriceValue" DOUBLE PRECISION`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "saleStatus" "MarketplaceSaleStatus" NOT NULL DEFAULT 'NEWLY_ADDED'`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "soldAt" TIMESTAMP(3)`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "MarketplaceProduct" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "MarketplaceProduct_condition_idx" ON "MarketplaceProduct"("condition")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "MarketplaceProduct_saleStatus_idx" ON "MarketplaceProduct"("saleStatus")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "MarketplaceProduct_offerPriceValue_idx" ON "MarketplaceProduct"("offerPriceValue")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "MarketplaceProduct_latitude_longitude_idx" ON "MarketplaceProduct"("latitude", "longitude")`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not ensure marketplace sale/resale columns: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureDropCategorySlugs() {
    try {
      await this.$executeRawUnsafe(`DROP INDEX IF EXISTS "Category_slug_key"`);
      await this.$executeRawUnsafe(`ALTER TABLE "Category" DROP COLUMN IF EXISTS "slug"`);
      await this.$executeRawUnsafe(`DROP INDEX IF EXISTS "Subcategory_slug_key"`);
      await this.$executeRawUnsafe(`ALTER TABLE "Subcategory" DROP COLUMN IF EXISTS "slug"`);
    } catch (error) {
      this.logger.warn(
        `Could not drop category/subcategory slug columns: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureDeviceTokenTable() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DeviceToken" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "token" TEXT NOT NULL,
          "platform" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
        )
      `);
      await this.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "DeviceToken_token_key" ON "DeviceToken"("token")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "DeviceToken_userId_idx" ON "DeviceToken"("userId")`,
      );
      await this.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "DeviceToken_platform_idx" ON "DeviceToken"("platform")`,
      );
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          ALTER TABLE "DeviceToken"
            ADD CONSTRAINT "DeviceToken_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
      `);
    } catch (error) {
      this.logger.warn(
        `Could not ensure DeviceToken table: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.keepAlive) clearInterval(this.keepAlive);
    await this.$disconnect();
  }
}
