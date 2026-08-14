import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKeywordDto, UpdateKeywordDto } from './dto/keyword.dto';

@Injectable()
export class KeywordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where: Prisma.KeywordWhereInput = {};
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

  async findOne(id: string) {
    const keyword = await this.prisma.keyword.findUnique({
      where: { id },
      include: { subcategory: true },
    });
    if (!keyword) throw new NotFoundException(`Keyword with ID ${id} not found`);
    return keyword;
  }

  async create(dto: CreateKeywordDto) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id: dto.subcategoryId },
    });
    if (!subcategory) {
      throw new NotFoundException(
        `Subcategory with ID ${dto.subcategoryId} not found`,
      );
    }

    try {
      return await this.prisma.keyword.create({
        data: {
          subcategoryId: dto.subcategoryId,
          term: dto.term.trim(),
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Keyword term already exists in this subcategory',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateKeywordDto) {
    await this.findOne(id);

    if (dto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: dto.subcategoryId },
      });
      if (!subcategory) {
        throw new NotFoundException(
          `Subcategory with ID ${dto.subcategoryId} not found`,
        );
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Keyword term already exists in this subcategory',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.keyword.delete({ where: { id } });
  }
}
