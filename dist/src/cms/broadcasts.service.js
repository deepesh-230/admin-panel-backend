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
exports.BroadcastsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let BroadcastsService = class BroadcastsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async notifyEndUsers(params) {
        const endUsers = await this.prisma.user.findMany({
            where: {
                isActive: true,
                role: { name: client_1.RoleName.END_USER },
            },
            select: { id: true },
        });
        const broadcastAt = new Date();
        if (endUsers.length > 0) {
            await this.prisma.userBroadcast.createMany({
                data: endUsers.map((user) => ({
                    userId: user.id,
                    contentType: params.contentType,
                    jobAlertId: params.jobAlertId,
                    usefulLinkId: params.usefulLinkId,
                    title: params.title,
                    body: params.body,
                    url: params.url,
                })),
            });
        }
        return {
            recipientCount: endUsers.length,
            broadcastAt,
            message: endUsers.length > 0
                ? `Broadcast sent to ${endUsers.length} app user(s)`
                : 'No active app users to notify',
        };
    }
    async broadcastUsefulLink(id) {
        const link = await this.prisma.usefulLink.findUnique({ where: { id } });
        if (!link)
            throw new common_1.BadRequestException('Useful link not found');
        if (!link.isActive) {
            throw new common_1.BadRequestException('Cannot broadcast an inactive useful link');
        }
        const result = await this.notifyEndUsers({
            contentType: client_1.BroadcastContentType.USEFUL_LINK,
            usefulLinkId: link.id,
            title: link.title,
            url: link.url,
        });
        const updated = await this.prisma.usefulLink.update({
            where: { id },
            data: { broadcastAt: result.broadcastAt },
        });
        return { ...updated, ...result };
    }
    async broadcastJobAlert(id) {
        const alert = await this.prisma.jobAlert.findUnique({ where: { id } });
        if (!alert)
            throw new common_1.BadRequestException('Job alert not found');
        if (!alert.isActive) {
            throw new common_1.BadRequestException('Cannot broadcast an inactive job alert');
        }
        const result = await this.notifyEndUsers({
            contentType: client_1.BroadcastContentType.JOB_ALERT,
            jobAlertId: alert.id,
            title: alert.title,
            body: alert.description ?? undefined,
        });
        const updated = await this.prisma.jobAlert.update({
            where: { id },
            data: { broadcastAt: result.broadcastAt },
        });
        return { ...updated, ...result };
    }
    listForUser(userId) {
        return this.prisma.userBroadcast.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async markRead(userId, id) {
        const row = await this.prisma.userBroadcast.findFirst({
            where: { id, userId },
        });
        if (!row)
            throw new common_1.BadRequestException('Broadcast not found');
        return this.prisma.userBroadcast.update({
            where: { id },
            data: { readAt: new Date() },
        });
    }
};
exports.BroadcastsService = BroadcastsService;
exports.BroadcastsService = BroadcastsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BroadcastsService);
//# sourceMappingURL=broadcasts.service.js.map