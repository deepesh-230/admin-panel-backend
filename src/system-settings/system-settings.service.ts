import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_SYSTEM_SETTINGS,
  SYSTEM_SETTING_KEYS,
} from './system-setting.defaults';

@Injectable()
export class SystemSettingsService implements OnModuleInit, OnModuleDestroy {
  private lifecycleTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaults();
    // Run once shortly after boot, then hourly.
    setTimeout(() => {
      void this.runJobAlertLifecycle();
    }, 15_000);
    this.lifecycleTimer = setInterval(
      () => {
        void this.runJobAlertLifecycle();
      },
      60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.lifecycleTimer) clearInterval(this.lifecycleTimer);
  }

  async ensureDefaults() {
    for (const setting of DEFAULT_SYSTEM_SETTINGS) {
      await this.prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {
          label: setting.label,
          description: setting.description,
        },
        create: setting,
      });
    }
  }

  list() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async getNumber(key: string, fallback: number) {
    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    const parsed = Number(row?.value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  }

  async getValue(key: string, fallback = '') {
    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    const value = row?.value?.trim();
    return value || fallback;
  }

  async updateMany(updates: { key: string; value: string }[]) {
    if (!updates?.length) throw new BadRequestException('No settings provided');

    const allowed = new Set(DEFAULT_SYSTEM_SETTINGS.map((s) => s.key));
    for (const item of updates) {
      if (!allowed.has(item.key as (typeof DEFAULT_SYSTEM_SETTINGS)[number]['key'])) {
        throw new BadRequestException(`Unknown setting key: ${item.key}`);
      }
      if (item.key === SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS) {
        const months = Number(item.value);
        if (!Number.isInteger(months) || months < 0 || months > 60) {
          throw new BadRequestException(
            'Job alert retention months must be an integer between 0 and 60',
          );
        }
      }
      if (item.key === SYSTEM_SETTING_KEYS.SPONSORSHIP_PLANS_HEADER) {
        const text = String(item.value ?? '').trim();
        if (!text) {
          throw new BadRequestException('Sponsorship plans header text is required');
        }
        if (text.length > 1000) {
          throw new BadRequestException('Sponsorship plans header must be at most 1000 characters');
        }
      }
    }

    await this.prisma.$transaction(
      updates.map((item) => {
        const meta = DEFAULT_SYSTEM_SETTINGS.find((s) => s.key === item.key);
        return this.prisma.systemSetting.upsert({
          where: { key: item.key },
          create: {
            key: item.key,
            value: String(item.value).trim(),
            label: meta?.label,
            description: meta?.description,
          },
          update: { value: String(item.value).trim() },
        });
      }),
    );

    return this.list();
  }

  /**
   * 1) Deactivate job alerts whose closing date (endsAt) is past.
   * 2) Hard-delete deactivated alerts past retention months after closing date.
   */
  async runJobAlertLifecycle() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const deactivated = await this.prisma.jobAlert.updateMany({
      where: {
        isActive: true,
        endsAt: { lt: startOfToday },
      },
      data: { isActive: false },
    });

    const retentionMonths = await this.getNumber(
      SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS,
      2,
    );
    const cutoff = new Date(startOfToday);
    cutoff.setMonth(cutoff.getMonth() - retentionMonths);

    const deleted = await this.prisma.jobAlert.deleteMany({
      where: {
        isActive: false,
        endsAt: { lt: cutoff },
      },
    });

    return {
      deactivated: deactivated.count,
      deleted: deleted.count,
      retentionMonths,
      cutoff: cutoff.toISOString(),
    };
  }

  /** Public/mobile visibility: active jobs, or closed jobs still within retention. */
  async listPublicJobAlerts() {
    const retentionMonths = await this.getNumber(
      SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS,
      2,
    );
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const retentionStart = new Date(startOfToday);
    retentionStart.setMonth(retentionStart.getMonth() - retentionMonths);

    return this.prisma.jobAlert.findMany({
      where: {
        OR: [
          { isActive: true },
          {
            isActive: false,
            endsAt: { gte: retentionStart },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
