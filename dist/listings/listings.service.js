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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ListingsService = class ListingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(searchQuery) {
        if (searchQuery) {
            return this.prisma.listing.findMany({
                where: {
                    OR: [
                        { product: { contains: searchQuery, mode: 'insensitive' } },
                        { email: { contains: searchQuery, mode: 'insensitive' } },
                        { category: { contains: searchQuery, mode: 'insensitive' } },
                    ],
                },
                orderBy: { sNo: 'asc' },
            });
        }
        return this.prisma.listing.findMany({ orderBy: { sNo: 'asc' } });
    }
    async findOne(id) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException(`Listing with ID ${id} not found`);
        return listing;
    }
    async create(data) {
        const last = await this.prisma.listing.findFirst({ orderBy: { sNo: 'desc' } });
        const nextSNo = (last?.sNo ?? 0) + 1;
        return this.prisma.listing.create({
            data: { ...data, sNo: nextSNo },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.listing.update({ where: { id }, data });
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return this.prisma.listing.update({
            where: { id },
            data: { status },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.listing.delete({ where: { id } });
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map