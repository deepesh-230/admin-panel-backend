import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryType, Prisma } from '@prisma/client';
import { normalizeBusinessCode } from '../common/utils/business-code';
import { CATALOG_TTL_MS, catalogCache, invalidateCatalogCache } from '../common/utils/ttl-cache';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, isActive?: boolean, type?: CategoryType) {
    const where: Prisma.CategoryWhereInput = {};

    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (type) where.type = type;
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const cacheKey = search?.trim()
      ? null
      : `categories:${isActive ?? 'any'}:${type ?? 'any'}`;
    if (cacheKey) {
      const hit = catalogCache.get<Awaited<ReturnType<CategoriesService['findAll']>>>(cacheKey);
      if (hit) return hit;
    }

    const rows = await this.prisma.category.findMany({
      where,
      include: { _count: { select: { subcategories: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    if (cacheKey) catalogCache.set(cacheKey, rows, CATALOG_TTL_MS);
    return rows;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: { keywords: true },
        },
      },
    });
    if (!category) throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async listSubcategories(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return this.prisma.subcategory.findMany({
      where: { categoryId },
      include: { keywords: true, _count: { select: { keywords: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async listSubcategoriesByCategoryIds(categoryIds: string[], activeOnly = false) {
    const ids = [...new Set(categoryIds.map((id) => id.trim()).filter(Boolean))];
    if (!ids.length) return [];
    return this.prisma.subcategory.findMany({
      where: {
        categoryId: { in: ids },
        ...(activeOnly ? { isActive: true } : {}),
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /** CSV: category,category_id,subcategory,subcategory_id,keywords */
  async exportCsv(): Promise<string> {
    const categories = await this.prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            keywords: {
              where: { isActive: true },
              orderBy: { term: 'asc' },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const header = 'category,category_id,subcategory,subcategory_id,keywords';
    const lines: string[] = [header];

    for (const category of categories) {
      if (!category.subcategories.length) {
        lines.push(
          [
            csvEscape(category.name),
            csvEscape(category.code || ''),
            '',
            '',
            '',
          ].join(','),
        );
        continue;
      }

      for (const sub of category.subcategories) {
        const keywords = sub.keywords.map((k) => k.term).join(', ');
        lines.push(
          [
            csvEscape(category.name),
            csvEscape(category.code || ''),
            csvEscape(sub.name),
            csvEscape(sub.code || ''),
            csvEscape(keywords),
          ].join(','),
        );
      }
    }

    return `${lines.join('\n')}\n`;
  }

  async create(dto: CreateCategoryDto) {
    const code = normalizeBusinessCode(dto.code, { required: true, field: 'code' });
    try {
      const row = await this.prisma.category.create({
        data: {
          name: dto.name,
          code,
          description: dto.description,
          isActive: dto.isActive ?? true,
          sortOrder: dto.sortOrder ?? 0,
          type: dto.type ?? CategoryType.SERVICE,
        },
      });
      invalidateCatalogCache();
      return row;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category name or code already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const code =
      dto.code !== undefined
        ? normalizeBusinessCode(dto.code, { required: true, field: 'code' })
        : undefined;

    try {
      const row = await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(code !== undefined && { code }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.type !== undefined && { type: dto.type }),
        },
      });
      invalidateCatalogCache();
      return row;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category name or code already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const row = await this.prisma.category.delete({ where: { id } });
    invalidateCatalogCache();
    return row;
  }
}
