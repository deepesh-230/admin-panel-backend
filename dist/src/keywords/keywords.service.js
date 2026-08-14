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
exports.KeywordsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let KeywordsService = class KeywordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search) {
        const where = {};
        if (search?.trim()) {
            where.term = { contains: search.trim(), mode: 'insensitive' };
        }
        return this.prisma.keyword.findMany({
            where,
            include: {
                subcategory: {
                    select: {
                        id: true,
                        name: true,
                        categoryId: true,
                        category: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { term: 'asc' },
        });
    }
    async findOne(id) {
        const keyword = await this.prisma.keyword.findUnique({
            where: { id },
            include: { subcategory: true },
        });
        if (!keyword)
            throw new common_1.NotFoundException(`Keyword with ID ${id} not found`);
        return keyword;
    }
    async create(dto) {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id: dto.subcategoryId },
        });
        if (!subcategory) {
            throw new common_1.NotFoundException(`Subcategory with ID ${dto.subcategoryId} not found`);
        }
        try {
            return await this.prisma.keyword.create({
                data: {
                    subcategoryId: dto.subcategoryId,
                    term: dto.term.trim(),
                    isActive: dto.isActive ?? true,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Keyword term already exists in this subcategory');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.subcategoryId) {
            const subcategory = await this.prisma.subcategory.findUnique({
                where: { id: dto.subcategoryId },
            });
            if (!subcategory) {
                throw new common_1.NotFoundException(`Subcategory with ID ${dto.subcategoryId} not found`);
            }
        }
        try {
            return await this.prisma.keyword.update({
                where: { id },
                data: {
                    ...(dto.term !== undefined && { term: dto.term.trim() }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.subcategoryId !== undefined && {
                        subcategoryId: dto.subcategoryId,
                    }),
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Keyword term already exists in this subcategory');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.keyword.delete({ where: { id } });
    }
};
exports.KeywordsService = KeywordsService;
exports.KeywordsService = KeywordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KeywordsService);
//# sourceMappingURL=keywords.service.js.map