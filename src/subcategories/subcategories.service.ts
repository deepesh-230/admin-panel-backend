import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizeBusinessCode } from '../common/utils/business-code';
import { invalidateCatalogCache } from '../common/utils/ttl-cache';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSubcategoryDto,
  ListSubcategoriesQueryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';
import { parseStateIds } from '../common/utils/state-scope';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListSubcategoriesQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;
    const categoryIds = parseStateIds(query.categoryId);

    const where: Prisma.SubcategoryWhereInput = {};
    if (categoryIds.length) where.categoryId = { in: categoryIds };
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortOrder: Prisma.SortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
    const orderBy: Prisma.SubcategoryOrderByWithRelationInput =
      query.sortBy === 'category'
        ? { category: { name: sortOrder } }
        : query.sortBy === 'name'
          ? { name: sortOrder }
          : query.sortBy === 'code'
            ? { code: sortOrder }
            : query.sortBy === 'isActive'
              ? { isActive: sortOrder }
              : { sortOrder };

    const [total, items] = await Promise.all([
      this.prisma.subcategory.count({ where }),
      this.prisma.subcategory.findMany({
        where,
        include: { category: { select: { id: true, name: true, code: true } } },
        orderBy: [orderBy, { name: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async findOne(id: string) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
        keywords: { orderBy: { term: 'asc' } },
      },
    });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }
    return subcategory;
  }

  async listKeywords(subcategoryId: string) {
    await this.findOne(subcategoryId);
    return this.prisma.keyword.findMany({
      where: { subcategoryId },
      orderBy: { term: 'asc' },
    });
  }

  async create(dto: CreateSubcategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    const code = normalizeBusinessCode(dto.code, { required: true, field: 'code' });

    try {
      const row = await this.prisma.subcategory.create({
        data: {
          categoryId: dto.categoryId,
          name: dto.name,
          code,
          description: dto.description,
          isActive: dto.isActive ?? true,
          sortOrder: dto.sortOrder ?? 0,
        },
        include: { keywords: true },
      });
      invalidateCatalogCache();
      return row;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Subcategory name or code already exists',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubcategoryDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    const code =
      dto.code !== undefined
        ? normalizeBusinessCode(dto.code, { required: true, field: 'code' })
        : undefined;

    try {
      const row = await this.prisma.subcategory.update({
        where: { id },
        data: {
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(code !== undefined && { code }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        },
        include: { keywords: true },
      });
      invalidateCatalogCache();
      return row;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Subcategory name or code already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const row = await this.prisma.subcategory.delete({ where: { id } });
    invalidateCatalogCache();
    return row;
  }
}
