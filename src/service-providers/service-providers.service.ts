import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProviderApprovalStatus, RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  assertStateAccess,
  resolveScopedStateId,
} from '../common/utils/state-scope';
import { haversineKm } from '../common/utils/geo';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignProviderAdminDto,
  CreateServiceProviderDto,
  ListServiceProvidersQueryDto,
  UpdateServiceProviderDto,
} from './dto/service-provider.dto';

const providerInclude = {
  category: { select: { id: true, name: true } },
  subcategory: { select: { id: true, name: true, categoryId: true } },
  state: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true, email: true } },
  admins: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          role: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { admins: true } },
} as const;

type ProviderRow = Prisma.ServiceProviderGetPayload<{ include: typeof providerInclude }>;

@Injectable()
export class ServiceProvidersService {
  constructor(private prisma: PrismaService) {}

  private sanitize(provider: ProviderRow, distanceKm?: number | null) {
    return {
      id: provider.id,
      name: provider.name,
      categoryId: provider.categoryId,
      subcategoryId: provider.subcategoryId,
      description: provider.description,
      phone: provider.phone,
      landline: provider.landline,
      email: provider.email,
      website: provider.website,
      address: provider.address,
      city: provider.city,
      stateId: provider.stateId,
      latitude: provider.latitude,
      longitude: provider.longitude,
      googlePlaceId: provider.googlePlaceId,
      about: provider.about,
      services: provider.services,
      coverPhotoUrl: provider.coverPhotoUrl,
      gallery: provider.gallery,
      isActive: provider.isActive,
      approvalStatus: provider.approvalStatus,
      rejectedReason: provider.rejectedReason,
      createdById: provider.createdById,
      approvedById: provider.approvedById,
      approvedAt: provider.approvedAt,
      category: provider.category,
      subcategory: provider.subcategory,
      state: provider.state,
      createdBy: provider.createdBy,
      approvedBy: provider.approvedBy,
      admins: provider.admins.map((a) => ({
        id: a.id,
        userId: a.userId,
        isPrimary: a.isPrimary,
        user: {
          id: a.user.id,
          name: a.user.name,
          email: a.user.email,
          phone: a.user.phone,
          isActive: a.user.isActive,
          role: a.user.role.name,
        },
        createdAt: a.createdAt,
      })),
      adminCount: provider._count.admins,
      distanceKm: distanceKm ?? null,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }

  private async assertCategoryLinks(
    categoryId: string,
    subcategoryId?: string | null,
  ) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('Category not found');

    if (subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: subcategoryId },
      });
      if (!subcategory) throw new BadRequestException('Subcategory not found');
      if (subcategory.categoryId !== categoryId) {
        throw new BadRequestException('Subcategory does not belong to the selected category');
      }
    }
  }

  private async assertProviderAdminAccess(currentUser: AuthUser, providerId: string) {
    if (currentUser.role !== RoleName.SERVICE_PROVIDER_ADMIN) return;

    const assignment = await this.prisma.serviceProviderAdmin.findUnique({
      where: {
        serviceProviderId_userId: {
          serviceProviderId: providerId,
          userId: currentUser.id,
        },
      },
    });
    if (!assignment) {
      throw new ForbiddenException('You can only access providers you administer');
    }
  }

  private async getScopedOrThrow(id: string, currentUser: AuthUser) {
    const provider = await this.prisma.serviceProvider.findUnique({
      where: { id },
      include: providerInclude,
    });
    if (!provider) throw new NotFoundException('Service provider not found');
    assertStateAccess(currentUser, provider.stateId);
    await this.assertProviderAdminAccess(currentUser, id);
    return provider;
  }

  private async resolveKeywordSubcategoryIds(term: string): Promise<string[]> {
    const keywords = await this.prisma.keyword.findMany({
      where: {
        isActive: true,
        term: { contains: term, mode: 'insensitive' },
      },
      select: { subcategoryId: true },
    });
    return [...new Set(keywords.map((k) => k.subcategoryId))];
  }

  private async buildSearchWhere(
    query: ListServiceProvidersQueryDto,
    options?: {
      forceApprovedActive?: boolean;
      scopedStateId?: string;
      providerAdminUserId?: string;
    },
  ): Promise<Prisma.ServiceProviderWhereInput> {
    const where: Prisma.ServiceProviderWhereInput = {};

    if (options?.providerAdminUserId) {
      where.admins = { some: { userId: options.providerAdminUserId } };
    }

    if (options?.forceApprovedActive) {
      where.approvalStatus = ProviderApprovalStatus.APPROVED;
      where.isActive = true;
    } else {
      if (query.approvalStatus) where.approvalStatus = query.approvalStatus;
      if (query.isActive === 'true') where.isActive = true;
      if (query.isActive === 'false') where.isActive = false;
    }

    if (options?.scopedStateId) where.stateId = options.scopedStateId;
    else if (query.stateId) where.stateId = query.stateId;

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.subcategoryId) where.subcategoryId = query.subcategoryId;
    if (query.city?.trim()) {
      where.city = { contains: query.city.trim(), mode: 'insensitive' };
    }

    const searchTerm = query.search?.trim();
    const keywordTerm = query.keyword?.trim();
    const text = searchTerm || keywordTerm;

    if (text) {
      const keywordSubIds = await this.resolveKeywordSubcategoryIds(text);
      const or: Prisma.ServiceProviderWhereInput[] = [
        { name: { contains: text, mode: 'insensitive' } },
        { email: { contains: text, mode: 'insensitive' } },
        { phone: { contains: text, mode: 'insensitive' } },
        { city: { contains: text, mode: 'insensitive' } },
        { address: { contains: text, mode: 'insensitive' } },
        { description: { contains: text, mode: 'insensitive' } },
        { services: { contains: text, mode: 'insensitive' } },
        { about: { contains: text, mode: 'insensitive' } },
        { category: { name: { contains: text, mode: 'insensitive' } } },
        { subcategory: { name: { contains: text, mode: 'insensitive' } } },
      ];
      if (keywordSubIds.length) {
        or.push({ subcategoryId: { in: keywordSubIds } });
      }
      // If both search and keyword provided, also resolve keyword separately
      if (searchTerm && keywordTerm && keywordTerm !== searchTerm) {
        const extra = await this.resolveKeywordSubcategoryIds(keywordTerm);
        if (extra.length) or.push({ subcategoryId: { in: extra } });
        or.push({
          subcategory: { name: { contains: keywordTerm, mode: 'insensitive' } },
        });
      }
      where.OR = or;
    }

    const hasGeo =
      query.latitude != null &&
      query.longitude != null &&
      query.radius != null &&
      query.radius > 0;
    if (hasGeo) {
      where.latitude = { not: null };
      where.longitude = { not: null };
    }

    return where;
  }

  private async runSearch(
    query: ListServiceProvidersQueryDto,
    options?: {
      forceApprovedActive?: boolean;
      scopedStateId?: string;
      providerAdminUserId?: string;
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const where = await this.buildSearchWhere(query, options);

    const hasGeo =
      query.latitude != null &&
      query.longitude != null &&
      query.radius != null &&
      query.radius > 0;

    const allowedSort = new Set([
      'createdAt',
      'updatedAt',
      'name',
      'approvalStatus',
      'distance',
    ]);
    const sortBy = allowedSort.has(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    if (!hasGeo) {
      const orderBy =
        sortBy === 'distance'
          ? ({ createdAt: sortOrder } as Prisma.ServiceProviderOrderByWithRelationInput)
          : ({ [sortBy]: sortOrder } as Prisma.ServiceProviderOrderByWithRelationInput);

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.serviceProvider.findMany({
          where,
          include: providerInclude,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.serviceProvider.count({ where }),
      ]);

      return {
        items: rows.map((row) => this.sanitize(row)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        },
      };
    }

    const originLat = query.latitude!;
    const originLng = query.longitude!;
    const radiusKm = query.radius!;

    const candidates = await this.prisma.serviceProvider.findMany({
      where,
      include: providerInclude,
    });

    const withDistance = candidates
      .map((row) => {
        const distanceKm = haversineKm(
          originLat,
          originLng,
          row.latitude as number,
          row.longitude as number,
        );
        return { row, distanceKm };
      })
      .filter((item) => item.distanceKm <= radiusKm);

    withDistance.sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = a.row.name.localeCompare(b.row.name);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const av = a.row[sortBy].getTime();
        const bv = b.row[sortBy].getTime();
        return sortOrder === 'asc' ? av - bv : bv - av;
      }
      // default + explicit distance
      return sortOrder === 'asc'
        ? a.distanceKm - b.distanceKm
        : b.distanceKm - a.distanceKm;
    });

    const total = withDistance.length;
    const pageItems = withDistance.slice(skip, skip + limit);

    return {
      items: pageItems.map(({ row, distanceKm }) =>
        this.sanitize(row, Math.round(distanceKm * 100) / 100),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async findAll(currentUser: AuthUser, query: ListServiceProvidersQueryDto) {
    const scopedStateId = resolveScopedStateId(currentUser, query.stateId);
    const providerAdminUserId =
      currentUser.role === RoleName.SERVICE_PROVIDER_ADMIN ? currentUser.id : undefined;
    return this.runSearch(query, { scopedStateId, providerAdminUserId });
  }

  /** Mobile/public discovery: approved + active only */
  async searchPublic(query: ListServiceProvidersQueryDto) {
    if (
      (query.latitude != null || query.longitude != null || query.radius != null) &&
      (query.latitude == null || query.longitude == null || query.radius == null)
    ) {
      throw new BadRequestException(
        'latitude, longitude, and radius are all required for nearby search',
      );
    }
    return this.runSearch(query, { forceApprovedActive: true });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const provider = await this.getScopedOrThrow(id, currentUser);
    return this.sanitize(provider);
  }

  async findOnePublic(id: string) {
    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        id,
        approvalStatus: ProviderApprovalStatus.APPROVED,
        isActive: true,
      },
      include: providerInclude,
    });
    if (!provider) throw new NotFoundException('Service provider not found');
    return this.sanitize(provider);
  }

  async create(dto: CreateServiceProviderDto, currentUser: AuthUser) {
    const stateId = resolveScopedStateId(currentUser, dto.stateId);
    if (!stateId) throw new BadRequestException('stateId is required');
    assertStateAccess(currentUser, stateId);

    const state = await this.prisma.state.findUnique({ where: { id: stateId } });
    if (!state) throw new BadRequestException('State not found');

    await this.assertCategoryLinks(dto.categoryId, dto.subcategoryId);

    const approvalStatus =
      dto.approvalStatus ??
      (currentUser.role === RoleName.ADMIN || currentUser.role === RoleName.STATE_ADMIN
        ? ProviderApprovalStatus.APPROVED
        : ProviderApprovalStatus.PENDING_APPROVAL);

    const provider = await this.prisma.serviceProvider.create({
      data: {
        name: dto.name.trim(),
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId,
        description: dto.description,
        phone: dto.phone,
        landline: dto.landline,
        email: dto.email,
        website: dto.website,
        address: dto.address,
        city: dto.city,
        stateId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        googlePlaceId: dto.googlePlaceId,
        about: dto.about,
        services: dto.services,
        coverPhotoUrl: dto.coverPhotoUrl,
        gallery: dto.gallery || [],
        isActive: dto.isActive ?? true,
        approvalStatus,
        createdById: currentUser.id,
        approvedById:
          approvalStatus === ProviderApprovalStatus.APPROVED ? currentUser.id : undefined,
        approvedAt:
          approvalStatus === ProviderApprovalStatus.APPROVED ? new Date() : undefined,
      },
      include: providerInclude,
    });

    return this.sanitize(provider);
  }

  async update(id: string, dto: UpdateServiceProviderDto, currentUser: AuthUser) {
    const existing = await this.getScopedOrThrow(id, currentUser);

    if (currentUser.role === RoleName.SERVICE_PROVIDER_ADMIN) {
      if (dto.stateId !== undefined && dto.stateId !== existing.stateId) {
        throw new ForbiddenException('Service provider admins cannot change state');
      }
      if (dto.isActive !== undefined) {
        throw new ForbiddenException('Service provider admins cannot change active status');
      }
    }

    const nextCategoryId = dto.categoryId ?? existing.categoryId;
    const nextSubcategoryId =
      dto.subcategoryId === undefined ? existing.subcategoryId : dto.subcategoryId;
    await this.assertCategoryLinks(nextCategoryId, nextSubcategoryId);

    let nextStateId = existing.stateId;
    if (dto.stateId) {
      assertStateAccess(currentUser, dto.stateId);
      if (currentUser.role === RoleName.STATE_ADMIN && dto.stateId !== currentUser.stateId) {
        throw new BadRequestException('Cannot move provider to another state');
      }
      const state = await this.prisma.state.findUnique({ where: { id: dto.stateId } });
      if (!state) throw new BadRequestException('State not found');
      nextStateId = dto.stateId;
    }

    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId === undefined ? undefined : dto.subcategoryId,
        description: dto.description,
        phone: dto.phone,
        landline: dto.landline,
        email: dto.email,
        website: dto.website,
        address: dto.address,
        city: dto.city,
        stateId: nextStateId,
        latitude: dto.latitude === undefined ? undefined : dto.latitude,
        longitude: dto.longitude === undefined ? undefined : dto.longitude,
        googlePlaceId: dto.googlePlaceId === undefined ? undefined : dto.googlePlaceId,
        about: dto.about,
        services: dto.services,
        coverPhotoUrl: dto.coverPhotoUrl === undefined ? undefined : dto.coverPhotoUrl,
        gallery: dto.gallery,
        isActive: dto.isActive,
      },
      include: providerInclude,
    });

    return this.sanitize(provider);
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.getScopedOrThrow(id, currentUser);
    await this.prisma.serviceProvider.delete({ where: { id } });
    return { id, deleted: true };
  }

  async approve(id: string, currentUser: AuthUser) {
    await this.getScopedOrThrow(id, currentUser);
    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        approvalStatus: ProviderApprovalStatus.APPROVED,
        approvedById: currentUser.id,
        approvedAt: new Date(),
        rejectedReason: null,
        isActive: true,
      },
      include: providerInclude,
    });
    return this.sanitize(provider);
  }

  async reject(id: string, reason: string, currentUser: AuthUser) {
    await this.getScopedOrThrow(id, currentUser);
    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        approvalStatus: ProviderApprovalStatus.REJECTED,
        rejectedReason: reason.trim(),
        approvedById: null,
        approvedAt: null,
        isActive: false,
      },
      include: providerInclude,
    });
    return this.sanitize(provider);
  }

  async listAdmins(id: string, currentUser: AuthUser) {
    const provider = await this.getScopedOrThrow(id, currentUser);
    return this.sanitize(provider).admins;
  }

  async assignAdmin(id: string, dto: AssignProviderAdminDto, currentUser: AuthUser) {
    await this.getScopedOrThrow(id, currentUser);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isActive) throw new BadRequestException('Cannot assign an inactive user');

    const spaRole = await this.prisma.role.findUnique({
      where: { name: RoleName.SERVICE_PROVIDER_ADMIN },
    });
    if (!spaRole) throw new BadRequestException('SERVICE_PROVIDER_ADMIN role is not configured');

    if (user.role.name !== RoleName.SERVICE_PROVIDER_ADMIN) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { roleId: spaRole.id },
      });
    }

    if (dto.isPrimary) {
      await this.prisma.serviceProviderAdmin.updateMany({
        where: { serviceProviderId: id },
        data: { isPrimary: false },
      });
    }

    try {
      await this.prisma.serviceProviderAdmin.create({
        data: {
          serviceProviderId: id,
          userId: dto.userId,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('User is already an admin of this provider');
      }
      throw err;
    }

    return this.listAdmins(id, currentUser);
  }

  async removeAdmin(id: string, userId: string, currentUser: AuthUser) {
    await this.getScopedOrThrow(id, currentUser);
    const assignment = await this.prisma.serviceProviderAdmin.findUnique({
      where: {
        serviceProviderId_userId: {
          serviceProviderId: id,
          userId,
        },
      },
    });
    if (!assignment) throw new NotFoundException('Provider admin assignment not found');

    await this.prisma.serviceProviderAdmin.delete({ where: { id: assignment.id } });
    return { serviceProviderId: id, userId, deleted: true };
  }
}
