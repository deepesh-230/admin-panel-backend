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
  assertAssignedStateOverlap,
  assertStateAccess,
  assignedStateIds,
  parseStateIds,
  resolveScopedStateIds,
} from '../common/utils/state-scope';
import {
  assertSubcategoryIds,
  parseCreatedAtRange,
  resolvePlaceProfileFields,
  syncUserDisabilities,
} from '../common/utils/user-profile';
import { invalidateAuthCache } from '../common/utils/ttl-cache';
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
  disabilities: {
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
  },
} as const;

const userListInclude = {
  role: true,
  state: true,
  disabilities: {
    include: {
      subcategory: { select: { id: true, name: true, categoryId: true } },
    },
  },
} as const;

type UserWithRelations = Prisma.UserGetPayload<{ include: typeof userInclude }>;
type UserListRow = Prisma.UserGetPayload<{ include: typeof userListInclude }>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitize(user: UserWithRelations | UserListRow) {
    const disabilities = (user.disabilities || []).map((d) => ({
      id: d.subcategory.id,
      name: d.subcategory.name,
      categoryId: d.subcategory.categoryId,
      categoryName:
        'category' in d.subcategory && d.subcategory.category
          ? d.subcategory.category.name
          : '',
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      city: user.city,
      latitude: user.latitude,
      longitude: user.longitude,
      pincode: user.pincode,
      ageRange: user.ageRange,
      isActive: user.isActive,
      stateId: user.stateId,
      role: user.role.name,
      roleDetails: user.role,
      state: user.state,
      states: ('userStates' in user ? user.userStates || [] : []).map((us) => ({
        ...us.state,
        isPrimary: us.isPrimary,
      })),
      disabilities,
      disabilitySubcategoryIds: disabilities.map((d) => d.id),
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
    const stateIds = resolveScopedStateIds(currentUser, query.stateId);

    const where: Prisma.UserWhereInput = {};

    const and: Prisma.UserWhereInput[] = [];

    if (stateIds?.length) {
      and.push({
        OR: [
          { stateId: { in: stateIds } },
          { userStates: { some: { stateId: { in: stateIds } } } },
        ],
      });
    }
    if (query.isActive === 'true') where.isActive = true;
    if (query.isActive === 'false') where.isActive = false;

    const createdAt = parseCreatedAtRange(query.createdFrom, query.createdTo);
    if (createdAt) where.createdAt = createdAt;

    // STATE_ADMIN cannot see main ADMIN accounts
    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (query.role === RoleName.ADMIN || query.role === RoleName.STATE_ADMIN) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
      where.role = query.role
        ? { name: query.role }
        : { NOT: { name: { in: [RoleName.ADMIN, RoleName.STATE_ADMIN] } } };
    } else if (query.role) {
      where.role = { name: query.role };
    }

    if (query.categoryType === 'CARE' || query.categoryType === 'SERVICE') {
      where.serviceProviderAdmins = {
        some: {
          serviceProvider: {
            category: { type: query.categoryType },
          },
        },
      };
    }

    const disabilitySubcategoryIds = parseStateIds(query.subcategoryId);
    const disabilityCategoryIds = parseStateIds(query.categoryId);
    if (disabilitySubcategoryIds.length) {
      where.disabilities = { some: { subcategoryId: { in: disabilitySubcategoryIds } } };
    } else if (disabilityCategoryIds.length) {
      where.disabilities = {
        some: { subcategory: { categoryId: { in: disabilityCategoryIds } } },
      };
    }

    if (query.name?.trim()) {
      where.name = { contains: query.name.trim(), mode: 'insensitive' };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      and.push({
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (and.length) where.AND = and;

    const allowedSort = new Set(['createdAt', 'email', 'name', 'updatedAt', 'isActive', 'role', 'state']);
    const sortBy = allowedSort.has(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder: Prisma.SortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'role'
        ? { role: { name: sortOrder } }
        : sortBy === 'state'
          ? { state: { name: sortOrder } }
          : { [sortBy]: sortOrder };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: userListInclude,
        orderBy,
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
      if (user.role.name === RoleName.ADMIN || user.role.name === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertAssignedStateOverlap(currentUser, [
        user.stateId,
        ...(user.userStates || []).map((us) => us.stateId),
      ]);
    }

    return this.sanitize(user);
  }

  async create(dto: CreateUserDto, currentUser: AuthUser) {
    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (dto.role === RoleName.ADMIN || dto.role === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('You cannot create this role');
      }
      const ids = assignedStateIds(currentUser);
      if (!ids.length) {
        throw new ForbiddenException('State admin has no assigned state');
      }
      if (dto.stateId) {
        assertStateAccess(currentUser, dto.stateId);
      } else {
        dto.stateId = ids[0];
      }
    }

    if (
      (dto.role === RoleName.STATE_ADMIN || dto.role === RoleName.ADMIN) &&
      currentUser.role !== RoleName.ADMIN
    ) {
      throw new ForbiddenException('Only main admin can create this role');
    }

    const place = await resolvePlaceProfileFields(this.prisma, {
      location: dto.location,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      pincode: dto.pincode,
      stateId: dto.stateId,
      stateName: dto.stateName,
    });
    const stateId = place.stateId ?? dto.stateId;

    if (dto.role === RoleName.STATE_ADMIN && !stateId) {
      throw new BadRequestException('stateId is required for STATE_ADMIN');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const disabilityIds = dto.disabilitySubcategoryIds
      ? await assertSubcategoryIds(this.prisma, dto.disabilitySubcategoryIds)
      : [];

    const role = await this.getRole(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name,
          phone: dto.phone,
          isActive: dto.isActive ?? true,
          roleId: role.id,
          ageRange: dto.ageRange,
          ...place,
          stateId,
          ...(stateId
            ? {
                userStates: {
                  create: { stateId, isPrimary: true },
                },
              }
            : {}),
        },
        include: userInclude,
      });

      if (disabilityIds.length) {
        await syncUserDisabilities(tx, created.id, disabilityIds);
        return tx.user.findUniqueOrThrow({
          where: { id: created.id },
          include: userInclude,
        });
      }

      return created;
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: AuthUser) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, userStates: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (existing.role.name === RoleName.ADMIN || existing.role.name === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertAssignedStateOverlap(currentUser, [
        existing.stateId,
        ...existing.userStates.map((us) => us.stateId),
      ]);
      if (dto.role && dto.role !== existing.role.name) {
        const allowed =
          (existing.role.name === RoleName.END_USER && dto.role === RoleName.VOLUNTEER) ||
          (existing.role.name === RoleName.VOLUNTEER && dto.role === RoleName.END_USER);
        if (!allowed) {
          throw new ForbiddenException('You can only promote/demote END_USER ↔ VOLUNTEER');
        }
      }
      if (dto.stateId) {
        assertStateAccess(currentUser, dto.stateId);
      }
    }

    if (dto.role === RoleName.ADMIN && currentUser.role !== RoleName.ADMIN) {
      throw new ForbiddenException('Only main admin can assign ADMIN role');
    }

    const place = await resolvePlaceProfileFields(this.prisma, {
      location: dto.location,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      pincode: dto.pincode,
      stateId: dto.stateId,
      stateName: dto.stateName,
    });

    let roleId: string | undefined;
    if (dto.role) {
      roleId = (await this.getRole(dto.role)).id;
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const disabilityIds =
      dto.disabilitySubcategoryIds !== undefined
        ? await assertSubcategoryIds(this.prisma, dto.disabilitySubcategoryIds)
        : undefined;

    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          isActive: dto.isActive,
          roleId,
          passwordHash,
          ageRange: dto.ageRange === undefined ? undefined : dto.ageRange,
          ...place,
        },
        include: userInclude,
      });

      if (place.stateId) {
        await tx.userState.upsert({
          where: {
            userId_stateId: { userId: id, stateId: place.stateId },
          },
          update: { isPrimary: true },
          create: { userId: id, stateId: place.stateId, isPrimary: true },
        });
      }

      if (disabilityIds !== undefined) {
        await syncUserDisabilities(tx, id, disabilityIds);
        return tx.user.findUniqueOrThrow({
          where: { id },
          include: userInclude,
        });
      }

      return updated;
    });

    invalidateAuthCache(id);
    return this.sanitize(user);
  }

  async updateStatus(id: string, isActive: boolean, currentUser: AuthUser) {
    return this.update(id, { isActive }, currentUser);
  }

  async remove(id: string, currentUser: AuthUser) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, userStates: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    if (existing.id === currentUser.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (existing.role.name === RoleName.ADMIN || existing.role.name === RoleName.STATE_ADMIN) {
        throw new ForbiddenException('Access denied');
      }
      assertAssignedStateOverlap(currentUser, [
        existing.stateId,
        ...existing.userStates.map((us) => us.stateId),
      ]);
    }

    if (existing.role.name === RoleName.ADMIN && currentUser.role !== RoleName.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.user.delete({ where: { id } });
    return { id, deleted: true };
  }
}
