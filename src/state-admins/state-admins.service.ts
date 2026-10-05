import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { invalidateAuthCache } from '../common/utils/ttl-cache';
import { CreateStateAdminDto, UpdateStateAdminDto } from './dto/state-admin.dto';

const stateAdminInclude = {
  role: true,
  state: true,
  userStates: { include: { state: true } },
} as const;

type StateAdminRow = Prisma.UserGetPayload<{ include: typeof stateAdminInclude }>;

@Injectable()
export class StateAdminsService {
  constructor(private prisma: PrismaService) {}

  private uniqueStateIds(dto: { stateId?: string; stateIds?: string[] }): string[] {
    return [...new Set([...(dto.stateIds || []), dto.stateId].filter((id): id is string => Boolean(id)))];
  }

  private sanitize(user: StateAdminRow) {
    const states = (user.userStates || []).map((us) => ({
      id: us.state.id,
      name: us.state.name,
      code: us.state.code,
      isPrimary: us.isPrimary,
    }));
    const stateIds = [...new Set([user.stateId, ...states.map((s) => s.id)].filter((id): id is string => Boolean(id)))];
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isActive: user.isActive,
      stateId: user.stateId,
      stateIds,
      role: user.role,
      state: user.state,
      states,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async assertStatesExist(ids: string[]) {
    if (!ids.length) {
      throw new BadRequestException('Assign at least one state');
    }
    const states = await this.prisma.state.findMany({ where: { id: { in: ids } } });
    if (states.length !== ids.length) {
      const found = new Set(states.map((s) => s.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new NotFoundException(`State not found: ${missing.join(', ')}`);
    }
    return ids;
  }

  private async replaceUserStates(tx: Prisma.TransactionClient, userId: string, stateIds: string[]) {
    await tx.userState.deleteMany({ where: { userId } });
    if (!stateIds.length) return;
    await tx.userState.createMany({
      data: stateIds.map((stateId, index) => ({
        userId,
        stateId,
        isPrimary: index === 0,
      })),
    });
  }

  async findAll(filters: { search?: string; stateId?: string; isActive?: boolean }) {
    const where: Prisma.UserWhereInput = {
      role: { name: RoleName.STATE_ADMIN },
    };

    if (filters.stateId) {
      where.OR = [
        { stateId: filters.stateId },
        { userStates: { some: { stateId: filters.stateId } } },
      ];
    }
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      const searchOr: Prisma.UserWhereInput[] = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOr }];
        delete where.OR;
      } else {
        where.OR = searchOr;
      }
    }

    const users = await this.prisma.user.findMany({
      where,
      include: stateAdminInclude,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.STATE_ADMIN } },
      include: stateAdminInclude,
    });
    if (!user) throw new NotFoundException(`State admin with ID ${id} not found`);
    return this.sanitize(user);
  }

  async create(dto: CreateStateAdminDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const stateIds = await this.assertStatesExist(this.uniqueStateIds(dto));
    const primaryStateId = stateIds[0];

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: RoleName.STATE_ADMIN },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        roleId: role.id,
        stateId: primaryStateId,
        userStates: {
          create: stateIds.map((stateId, index) => ({
            stateId,
            isPrimary: index === 0,
          })),
        },
      },
      include: stateAdminInclude,
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateStateAdminDto) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.STATE_ADMIN } },
    });
    if (!existing) throw new NotFoundException(`State admin with ID ${id} not found`);

    const nextStateIds =
      dto.stateIds !== undefined || dto.stateId !== undefined
        ? await this.assertStatesExist(this.uniqueStateIds(dto))
        : null;

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(nextStateIds && { stateId: nextStateIds[0] }),
          ...(passwordHash && { passwordHash }),
        },
        include: stateAdminInclude,
      });

      if (nextStateIds) {
        await this.replaceUserStates(tx, id, nextStateIds);
        return tx.user.findUniqueOrThrow({
          where: { id },
          include: stateAdminInclude,
        });
      }

      return updated;
    });

    invalidateAuthCache(id);
    return this.sanitize(user);
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.STATE_ADMIN } },
    });
    if (!existing) throw new NotFoundException(`State admin with ID ${id} not found`);

    await this.prisma.user.delete({ where: { id } });
    invalidateAuthCache(id);
    return { id, deleted: true };
  }
}
