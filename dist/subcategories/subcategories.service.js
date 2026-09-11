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
exports.SubcategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const slugify_1 = require("../common/utils/slugify");
const prisma_service_1 = require("../prisma/prisma.service");
let SubcategoriesService = class SubcategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        const subcategory = await this.prisma.subcategory.findUnique({
            where: { id },
            include: {
                category: true,
                keywords: { orderBy: { term: 'asc' } },
            },
        });
        if (!subcategory) {
            throw new common_1.NotFoundException(`Subcategory with ID ${id} not found`);
        }
        return subcategory;
    }
    async listKeywords(subcategoryId) {
        await this.findOne(subcategoryId);
        return this.prisma.keyword.findMany({
            where: { subcategoryId },
            orderBy: { term: 'asc' },
        });
    }
    async create(dto) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${dto.categoryId} not found`);
        }
        const slug = dto.slug?.trim() || (0, slugify_1.slugify)(dto.name);
        try {
            return await this.prisma.subcategory.create({
                data: {
                    categoryId: dto.categoryId,
                    name: dto.name,
                    slug,
                    description: dto.description,
                    isActive: dto.isActive ?? true,
                    sortOrder: dto.sortOrder ?? 0,
                },
                include: { keywords: true },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Subcategory name already exists in this category');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Category with ID ${dto.categoryId} not found`);
            }
        }
        const slug = dto.slug !== undefined
            ? dto.slug.trim() || undefined
            : dto.name
                ? (0, slugify_1.slugify)(dto.name)
                : undefined;
        try {
            return await this.prisma.subcategory.update({
                where: { id },
                data: {
                    ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(slug !== undefined && { slug }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                    ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                },
                include: { keywords: true },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Subcategory name already exists in this category');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.subcategory.delete({ where: { id } });
    }
};
exports.SubcategoriesService = SubcategoriesService;
exports.SubcategoriesService = SubcategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubcategoriesService);
//# sourceMappingURL=subcategories.service.js.map