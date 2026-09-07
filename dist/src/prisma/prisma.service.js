"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const india_states_1 = require("../states/india-states");
const MAX_CONNECT_RETRIES = 6;
const CONNECT_RETRY_DELAY_MS = 5000;
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                const retryable = message.includes("Can't reach database server") || message.includes('P1001');
                if (!retryable || attempt === MAX_CONNECT_RETRIES) {
                    this.logger.error('Database connection failed. If using Neon, wake the project in the Neon console or use the pooled connection string.');
                    throw error;
                }
                this.logger.warn(`Database unreachable (attempt ${attempt}/${MAX_CONNECT_RETRIES}), retrying in ${CONNECT_RETRY_DELAY_MS / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, CONNECT_RETRY_DELAY_MS));
            }
        }
    }
    async ensureSocialSettingTable() {
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
            await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SocialSetting_isActive_idx" ON "SocialSetting"("isActive")`);
            await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SocialSetting_name_idx" ON "SocialSetting"("name")`);
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
        }
        catch (error) {
            this.logger.warn(`Could not ensure SocialSetting table: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async ensureIndiaStates() {
        try {
            const existing = await this.state.findMany({ select: { name: true } });
            const existingNames = new Set(existing.map((s) => s.name));
            const missing = india_states_1.INDIA_STATES.filter((s) => !existingNames.has(s.name));
            if (!missing.length)
                return;
            for (const state of missing) {
                await this.state.upsert({
                    where: { name: state.name },
                    update: { code: state.code, isActive: true },
                    create: { name: state.name, code: state.code, isActive: true },
                });
            }
            this.logger.log(`Ensured Indian states (${missing.length} added)`);
        }
        catch (error) {
            this.logger.warn(`Could not ensure Indian states: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map