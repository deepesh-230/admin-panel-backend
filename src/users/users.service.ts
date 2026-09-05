import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/user.dto';

const userInclude = {
  role: true,
  state: true,
  userStates: { include: { state: true } },
} as const;

@Injectable()
export class UsersService {
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
    role: { id: string; name: RoleName; description: string | null };
    state: { id: string; name: string; code: string | null } | null;
    userStates?: {
      isPrimary: boolean;
      state: { id: string; name: string; code: string | null };
    }[];
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isActive: user.isActive,
      stateId: user.stateId,
      role: user.role.name,
      roleDetails: user.role,
      state: user.state,
      states: (user.userStates || []).map((us) => ({
        ...us.state,
        isPrimary: us.isPrimary,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async getRole(roleName: RoleName) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new BadRequestException(`Role ${roleName} is not configured`);
    return role;
  }

  async findAll(currentUser: AuthUser, query: ListUsersQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const stateId = resolveScopedStateId(currentUser, query.stateId);

    const where: Prisma.UserWhereInput = {};

    if (stateId) where.stateId = stateId;
    if (query.isActive === 'true') where.isActive = true;
    if (query.isActive === 'false') where.isActive = false;

    // STATE_ADMIN cannot see main ADMIN accounts
    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (query.role === RoleName.ADMIN) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
      where.role = query.role
        ? { name: query.role }
        : { NOT: { name: RoleName.ADMIN } };
    } else if (query.role) {
      where.role = { name: query.role };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const allowedSort = new Set(['createdAt', 'email', 'name', 'updatedAt']);
    const sortBy = allowedSort.has(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: users.map((u) => this.sanitize(u)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async findOne(id: string, currentUser: AuthUser) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) throw new NotFoundException('User not found');

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (user.role.name === RoleName.ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertStateAccess(currentUser, user.stateId);
    }

    return this.sanitize(user);
  }

  async create(dto: CreateUserDto, currentUser: AuthUser) {
    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (dto.role === RoleName.ADMIN || dto.role === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('You cannot create this role');
      }
      if (!currentUser.stateId) {
        throw new ForbiddenException('State admin has no assigned state');
      }
      dto.stateId = currentUser.stateId;
    }

    if (
      (dto.role === RoleName.STATE_ADMIN || dto.role === RoleName.ADMIN) &&
      currentUser.role !== RoleName.ADMIN
    ) {
      throw new ForbiddenException('Only main admin can create this role');
    }

    if (dto.role === RoleName.STATE_ADMIN && !dto.stateId) {
      throw new BadRequestException('stateId is required for STATE_ADMIN');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.stateId) {
      const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
      if (!state) throw new BadRequestException('Invalid stateId');
    }

    const role = await this.getRole(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        isActive: dto.isActive ?? true,
        roleId: role.id,
        stateId: dto.stateId,
        ...(dto.stateId
          ? {
              userStates: {
                create: { stateId: dto.stateId, isPrimary: true },
              },
            }
          : {}),
      },
      include: userInclude,
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: AuthUser) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (existing.role.name === RoleName.ADMIN || existing.role.name === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertStateAccess(currentUser, existing.stateId);
      if (dto.role && dto.role !== existing.role.name) {
        const allowed =
          (existing.role.name === RoleName.END_USER && dto.role === RoleName.VOLUNTEER) ||
          (existing.role.name === RoleName.VOLUNTEER && dto.role === RoleName.END_USER);
        if (!allowed) {
          throw new ForbiddenException('You can only promote/demote END_USER ↔ VOLUNTEER');
        }
      }
      if (dto.stateId && dto.stateId !== currentUser.stateId) {
        throw new ForbiddenException('You cannot move users to another state');
      }
      dto.stateId = currentUser.stateId;
    }

    if (dto.role === RoleName.ADMIN && currentUser.role !== RoleName.ADMIN) {
      throw new ForbiddenException('Only main admin can assign ADMIN role');
    }

    if (dto.stateId) {
      const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
      if (!state) throw new BadRequestException('Invalid stateId');
    }

    let roleId: string | undefined;
    if (dto.role) {
      roleId = (await this.getRole(dto.role)).id;
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          isActive: dto.isActive,
          stateId: dto.stateId === undefined ? undefined : dto.stateId,
          roleId,
          passwordHash,
        },
        include: userInclude,
      });

      if (dto.stateId) {
        await tx.userState.upsert({
          where: {
            userId_stateId: { userId: id, stateId: dto.stateId },
          },
          update: { isPrimary: true },
          create: { userId: id, stateId: dto.stateId, isPrimary: true },
        });
      }

      return updated;
    });

    return this.sanitize(user);
  }

  async updateStatus(id: string, isActive: boolean, currentUser: AuthUser) {
    return this.update(id, { isActive }, currentUser);
  }

  async remove(id: string, currentUser: AuthUser) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    if (existing.id === currentUser.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (existing.role.name === RoleName.ADMIN || existing.role.name === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertStateAccess(currentUser, existing.stateId);
    }

    if (existing.role.name === RoleName.ADMIN && currentUser.role !== RoleName.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
