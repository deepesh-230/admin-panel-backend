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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slugify_1 = require("../common/utils/slugify");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, isActive) {
        const where = {};
        if (typeof isActive === 'boolean')
            where.isActive = isActive;
        if (search?.trim()) {
            where.OR = [
                { name: { contains: search.trim(), mode: 'insensitive' } },
                { slug: { contains: search.trim(), mode: 'insensitive' } },
                { description: { contains: search.trim(), mode: 'insensitive' } },
            ];
        }
        return this.prisma.category.findMany({
            where,
            include: { _count: { select: { subcategories: true } } },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                subcategories: {
                    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                    include: { keywords: true },
                },
            },
        });
        if (!category)
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        return category;
    }
    async listSubcategories(categoryId) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        return this.prisma.subcategory.findMany({
            where: { categoryId },
            include: { keywords: true, _count: { select: { keywords: true } } },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }
    async create(dto) {
        const slug = dto.slug?.trim() || (0, slugify_1.slugify)(dto.name);
        try {
            return await this.prisma.category.create({
                data: {
                    name: dto.name,
                    slug,
                    description: dto.description,
                    isActive: dto.isActive ?? true,
                    sortOrder: dto.sortOrder ?? 0,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Category name or slug already exists');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        const slug = dto.slug !== undefined
            ? dto.slug.trim() || undefined
            : dto.name
                ? (0, slugify_1.slugify)(dto.name)
                : undefined;
        try {
            return await this.prisma.category.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(slug !== undefined && { slug }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Category name or slug already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.category.delete({ where: { id } });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map