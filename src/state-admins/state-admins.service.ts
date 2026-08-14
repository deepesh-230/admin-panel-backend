import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  assertStateAccess,
  resolveScopedStateId,
} from '../common/utils/state-scope';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStateAdminDto, UpdateStateAdminDto } from './dto/state-admin.dto';

const stateAdminInclude = {
  role: true,
  state: true,
} as const;

@Injectable()
export class StateAdminsService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    isActive: boolean;
    stateId: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: { id: string; name: RoleName };
    state: { id: string; name: string; code: string | null; isActive: boolean } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isActive: user.isActive,
      stateId: user.stateId,
      role: user.role,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private scopedStateId(
    currentUser: AuthUser,
    requestedStateId?: string,
  ): string | undefined {
    return resolveScopedStateId(currentUser, requestedStateId);
  }

  async findAll(
    currentUser: AuthUser,
    filters: { search?: string; stateId?: string; isActive?: boolean },
  ) {
    const stateId = this.scopedStateId(currentUser, filters.stateId);

    const where: Prisma.UserWhereInput = {
      role: { name: RoleName.STATE_ADMIN },
    };

    if (stateId) where.stateId = stateId;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: stateAdminInclude,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.sanitize(u));
  }

  async findOne(id: string, currentUser: AuthUser) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.STATE_ADMIN } },
      include: stateAdminInclude,
    });
    if (!user) throw new NotFoundException(`State admin with ID ${id} not found`);
    assertStateAccess(currentUser, user.stateId);
    return this.sanitize(user);
  }

  async create(dto: CreateStateAdminDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
    if (!state) throw new NotFoundException(`State with ID ${dto.stateId} not found`);

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: RoleName.STATE_ADMIN },
    });

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        roleId: role.id,
        stateId: dto.stateId,
        userStates: {
          create: {
            stateId: dto.stateId,
            isPrimary: true,
          },
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

    if (dto.stateId) {
      const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
      if (!state) throw new NotFoundException(`State with ID ${dto.stateId} not found`);
    }

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
          ...(dto.stateId !== undefined && { stateId: dto.stateId }),
          ...(passwordHash && { passwordHash }),
        },
        include: stateAdminInclude,
      });

      if (dto.stateId && dto.stateId !== existing.stateId) {
        if (existing.stateId) {
          await tx.userState.updateMany({
            where: { userId: id, isPrimary: true },
            data: { isPrimary: false },
          });
        }

        await tx.userState.upsert({
          where: {
            userId_stateId: { userId: id, stateId: dto.stateId },
          },
          update: { isPrimary: true },
          create: {
            userId: id,
            stateId: dto.stateId,
            isPrimary: true,
          },
        });
      }

      return updated;
    });

    return this.sanitize(user);
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: { name: RoleName.STATE_ADMIN } },
    });
    if (!existing) throw new NotFoundException(`State admin with ID ${id} not found`);

    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
