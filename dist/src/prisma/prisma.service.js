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
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map