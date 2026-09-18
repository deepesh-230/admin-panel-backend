import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { catalogCache, STATES_TTL_MS } from '../common/utils/ttl-cache';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';

@Injectable()
export class StatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, isActive?: boolean) {
    const cacheKey =
      !search?.trim() && typeof isActive !== 'boolean' ? 'states:admin:all' : null;
    if (cacheKey) {
      const hit = catalogCache.get<Awaited<ReturnType<StatesService['findAll']>>>(cacheKey);
      if (hit) return hit;
    }

    const where: Prisma.StateWhereInput = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { code: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.state.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    if (cacheKey) catalogCache.set(cacheKey, rows, STATES_TTL_MS);
    return rows;
  }

  async findOne(id: string) {
    const state = await this.prisma.state.findUnique({ where: { id } });
    if (!state) throw new NotFoundException(`State with ID ${id} not found`);
    return state;
  }

  async create(dto: CreateStateDto) {
    try {
      const created = await this.prisma.state.create({
        data: {
          name: dto.name,
          code: dto.code,
          isActive: dto.isActive ?? true,
        },
      });
      catalogCache.delete('states:admin:all');
      catalogCache.deletePrefix('states:');
      return created;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('State name or code already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateStateDto) {
    await this.findOne(id);
    try {
      const updated = await this.prisma.state.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.code !== undefined && { code: dto.code }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
      catalogCache.delete('states:admin:all');
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('State name or code already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const linkedUsers = await this.prisma.user.count({
      where: {
        OR: [{ stateId: id }, { userStates: { some: { stateId: id } } }],
      },
    });

    if (linkedUsers > 0) {
      throw new BadRequestException(
        'Cannot delete state while users are linked to it',
      );
    }

    return this.prisma.state.delete({ where: { id } }).then((deleted) => {
      catalogCache.delete('states:admin:all');
      catalogCache.delete('states:public');
      return deleted;
    });
  }
}
