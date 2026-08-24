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
exports.EnquiriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnquiriesService = class EnquiriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(searchQuery, kind) {
        const where = {};
        if (kind)
            where.kind = kind;
        if (searchQuery) {
            where.OR = [
                { product: { contains: searchQuery, mode: 'insensitive' } },
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { email: { contains: searchQuery, mode: 'insensitive' } },
                { category: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }
        return this.prisma.enquiry.findMany({
            where,
            orderBy: { sNo: 'asc' },
        });
    }
    async findOne(id) {
        const enquiry = await this.prisma.enquiry.findUnique({ where: { id } });
        if (!enquiry)
            throw new common_1.NotFoundException(`Enquiry with ID ${id} not found`);
        return enquiry;
    }
    async create(data) {
        const last = await this.prisma.enquiry.findFirst({ orderBy: { sNo: 'desc' } });
        const nextSNo = (last?.sNo ?? 0) + 1;
        return this.prisma.enquiry.create({
            data: { ...data, sNo: nextSNo, kind: data.kind || 'USER' },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.enquiry.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.enquiry.delete({ where: { id } });
    }
};
exports.EnquiriesService = EnquiriesService;
exports.EnquiriesService = EnquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnquiriesService);
//# sourceMappingURL=enquiries.service.js.map