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
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const adminProductInclude = {
    createdBy: { select: { id: true, name: true, email: true } },
};
let MarketplaceService = class MarketplaceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listAdmin(search, listingIntent) {
        const where = {};
        const intent = listingIntent?.trim().toLowerCase();
        if (intent === 'buy' || intent === 'sell') {
            where.listingIntent = intent;
        }
        if (search?.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { sellerName: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } },
                { brand: { contains: q, mode: 'insensitive' } },
                { color: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { createdBy: { name: { contains: q, mode: 'insensitive' } } },
            ];
        }
        return this.prisma.marketplaceProduct.findMany({
            where,
            include: adminProductInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAdmin(id) {
        const product = await this.prisma.marketplaceProduct.findUnique({
            where: { id },
            include: adminProductInclude,
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    createAdmin(data) {
        const intent = (data.listingIntent || 'sell').toLowerCase();
        return this.prisma.marketplaceProduct.create({
            data: {
                name: data.name.trim(),
                actualPrice: data.actualPrice,
                offerPrice: data.offerPrice,
                phone: data.phone,
                listingIntent: intent === 'buy' ? 'buy' : 'sell',
                sellerName: data.sellerName,
                description: data.description,
                address: data.address,
                color: data.color,
                brand: data.brand,
                features: data.features,
                location: data.location,
                gallery: data.gallery || [],
                isActive: data.isActive ?? true,
                stateId: data.stateId,
                approvalStatus: data.approvalStatus ?? 'APPROVED',
                adminFlag: data.adminFlag ?? 'ACTIVE',
            },
            include: adminProductInclude,
        });
    }
    async updateAdmin(id, data) {
        await this.findAdmin(id);
        const payload = { ...data };
        if (typeof payload.name === 'string')
            payload.name = payload.name.trim();
        if (typeof payload.listingIntent === 'string') {
            const intent = payload.listingIntent.toLowerCase();
            payload.listingIntent = intent === 'buy' ? 'buy' : 'sell';
        }
        if (payload.adminFlag === 'DELETE') {
            payload.deletedAt = new Date();
        }
        else if (payload.adminFlag) {
            payload.deletedAt = null;
        }
        return this.prisma.marketplaceProduct.update({
            where: { id },
            data: payload,
            include: adminProductInclude,
        });
    }
    async removeAdmin(id) {
        await this.findAdmin(id);
        return this.prisma.marketplaceProduct.delete({ where: { id } });
    }
    listPublic(search) {
        const where = {
            isActive: true,
            deletedAt: null,
            adminFlag: { not: 'DELETE' },
            approvalStatus: { in: ['APPROVED', 'PENDING'] },
        };
        if (search?.trim()) {
            const q = search.trim();
            where.AND = [
                {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { address: { contains: q, mode: 'insensitive' } },
                        { brand: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        return this.prisma.marketplaceProduct.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findPublic(id) {
        const product = await this.prisma.marketplaceProduct.findFirst({
            where: {
                id,
                isActive: true,
                deletedAt: null,
                adminFlag: { not: 'DELETE' },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    listForUser(userId) {
        return this.prisma.marketplaceProduct.findMany({
            where: { createdById: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createForUser(userId, sellerName, data) {
        const intent = (data.listingIntent || 'sell').toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { stateId: true },
        });
        return this.prisma.marketplaceProduct.create({
            data: {
                name: data.name.trim(),
                actualPrice: data.actualPrice,
                offerPrice: data.offerPrice,
                phone: data.phone,
                listingIntent: intent === 'buy' ? 'buy' : 'sell',
                sellerName: sellerName || undefined,
                description: data.description,
                address: data.address,
                color: data.color,
                brand: data.brand,
                features: data.features,
                location: data.location,
                gallery: data.gallery || [],
                createdById: userId,
                stateId: data.stateId || user?.stateId || undefined,
                isActive: true,
                approvalStatus: 'PENDING',
            },
        });
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map