import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { slugify } from '../common/utils/slugify';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

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

    const slug = dto.slug?.trim() || slugify(dto.name);

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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Subcategory name already exists in this category',
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

    const slug =
      dto.slug !== undefined
        ? dto.slug.trim() || undefined
        : dto.name
          ? slugify(dto.name)
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Subcategory name already exists in this category',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subcategory.delete({ where: { id } });
  }
}
