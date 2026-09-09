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
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CmsService = class CmsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    client(model) {
        return this.prisma[model];
    }
    async findAll(model, search, searchFields = ['title', 'name'], extraWhere = {}) {
        const where = { ...extraWhere };
        if (search?.trim()) {
            where.OR = searchFields.map((field) => ({
                [field]: { contains: search.trim(), mode: client_1.Prisma.QueryMode.insensitive },
            }));
        }
        return this.client(model).findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findJobAlerts(filters) {
        const where = {};
        if (filters.search?.trim()) {
            const q = filters.search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (typeof filters.isActive === 'boolean') {
            where.isActive = filters.isActive;
        }
        const startsAt = {};
        if (filters.postFrom)
            startsAt.gte = new Date(`${filters.postFrom}T00:00:00.000Z`);
        if (filters.postTo)
            startsAt.lte = new Date(`${filters.postTo}T23:59:59.999Z`);
        if (Object.keys(startsAt).length)
            where.startsAt = startsAt;
        const endsAt = {};
        if (filters.closeFrom)
            endsAt.gte = new Date(`${filters.closeFrom}T00:00:00.000Z`);
        if (filters.closeTo)
            endsAt.lte = new Date(`${filters.closeTo}T23:59:59.999Z`);
        if (Object.keys(endsAt).length)
            where.endsAt = endsAt;
        return this.prisma.jobAlert.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(model, id) {
        const row = await this.client(model).findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Record not found');
        return row;
    }
    create(model, data) {
        return this.client(model).create({ data });
    }
    async update(model, id, data) {
        await this.findOne(model, id);
        return this.client(model).update({ where: { id }, data });
    }
    async remove(model, id) {
        await this.findOne(model, id);
        return this.client(model).delete({ where: { id } });
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CmsService);
//# sourceMappingURL=cms.service.js.map