"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const system_setting_defaults_1 = require("./system-setting.defaults");
let SystemSettingsService = class SystemSettingsService {
    prisma;
    lifecycleTimer = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureDefaults();
        setTimeout(() => {
            void this.runJobAlertLifecycle();
        }, 15_000);
        this.lifecycleTimer = setInterval(() => {
            void this.runJobAlertLifecycle();
        }, 60 * 60 * 1000);
    }
    onModuleDestroy() {
        if (this.lifecycleTimer)
            clearInterval(this.lifecycleTimer);
    }
    async ensureDefaults() {
        for (const setting of system_setting_defaults_1.DEFAULT_SYSTEM_SETTINGS) {
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
    async getNumber(key, fallback) {
        const row = await this.prisma.systemSetting.findUnique({ where: { key } });
        const parsed = Number(row?.value);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    }
    async getValue(key, fallback = '') {
        const row = await this.prisma.systemSetting.findUnique({ where: { key } });
        const value = row?.value?.trim();
        return value || fallback;
    }
    async updateMany(updates) {
        if (!updates?.length)
            throw new common_1.BadRequestException('No settings provided');
        const allowed = new Set(system_setting_defaults_1.DEFAULT_SYSTEM_SETTINGS.map((s) => s.key));
        for (const item of updates) {
            if (!allowed.has(item.key)) {
                throw new common_1.BadRequestException(`Unknown setting key: ${item.key}`);
            }
            if (item.key === system_setting_defaults_1.SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS) {
                const months = Number(item.value);
                if (!Number.isInteger(months) || months < 0 || months > 60) {
                    throw new common_1.BadRequestException('Job alert retention months must be an integer between 0 and 60');
                }
            }
            if (item.key === system_setting_defaults_1.SYSTEM_SETTING_KEYS.SPONSORSHIP_PLANS_HEADER) {
                const text = String(item.value ?? '').trim();
                if (!text) {
                    throw new common_1.BadRequestException('Sponsorship plans header text is required');
                }
                if (text.length > 1000) {
                    throw new common_1.BadRequestException('Sponsorship plans header must be at most 1000 characters');
                }
            }
        }
        await this.prisma.$transaction(updates.map((item) => {
            const meta = system_setting_defaults_1.DEFAULT_SYSTEM_SETTINGS.find((s) => s.key === item.key);
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
        }));
        return this.list();
    }
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
        const retentionMonths = await this.getNumber(system_setting_defaults_1.SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS, 2);
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
    async listPublicJobAlerts() {
        const retentionMonths = await this.getNumber(system_setting_defaults_1.SYSTEM_SETTING_KEYS.JOB_ALERT_RETENTION_MONTHS, 2);
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
};
exports.SystemSettingsService = SystemSettingsService;
exports.SystemSettingsService = SystemSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemSettingsService);
//# sourceMappingURL=system-settings.service.js.map