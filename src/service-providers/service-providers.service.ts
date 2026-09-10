import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProviderApprovalStatus, RoleName, BusinessVerificationStatus } from '@prisma/client';
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
      businessVerificationStatus: provider.businessVerificationStatus,
      mcaId: provider.mcaId,
      din: provider.din,
      gstin: provider.gstin,
      nmcId: provider.nmcId,
      panId: provider.panId,
      verificationSubmittedAt: provider.verificationSubmittedAt,
      verificationNote: provider.verificationNote,
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
      'city',
      'isActive',
      'state',
      'category',
    ]);
    const sortBy = allowedSort.has(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    if (!hasGeo) {
      const orderBy =
        sortBy === 'distance'
          ? ({ createdAt: sortOrder } as Prisma.ServiceProviderOrderByWithRelationInput)
          : sortBy === 'state'
            ? ({ state: { name: sortOrder } } as Prisma.ServiceProviderOrderByWithRelationInput)
            : sortBy === 'category'
              ? ({ category: { name: sortOrder } } as Prisma.ServiceProviderOrderByWithRelationInput)
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
      if (sortBy === 'name' || sortBy === 'city') {
        const av = String(a.row[sortBy] || '');
        const bv = String(b.row[sortBy] || '');
        const cmp = av.localeCompare(bv);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'approvalStatus') {
        const cmp = a.row.approvalStatus.localeCompare(b.row.approvalStatus);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'isActive') {
        const cmp = Number(a.row.isActive) - Number(b.row.isActive);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'state') {
        const cmp = (a.row.state?.name || '').localeCompare(b.row.state?.name || '');
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'category') {
        const cmp = (a.row.category?.name || '').localeCompare(b.row.category?.name || '');
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
    const existing = await this.getScopedOrThrow(id, currentUser);
    if (
      existing.businessVerificationStatus !== BusinessVerificationStatus.IN_PROGRESS &&
      existing.businessVerificationStatus !== BusinessVerificationStatus.VERIFIED
    ) {
      throw new BadRequestException(
        'User has not submitted business verification yet. Wait for MCA/DIN/GSTIN/NMC/PAN details.',
      );
    }
    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        approvalStatus: ProviderApprovalStatus.APPROVED,
        approvedById: currentUser.id,
        approvedAt: new Date(),
        rejectedReason: null,
        isActive: true,
        businessVerificationStatus: BusinessVerificationStatus.VERIFIED,
        verificationNote: null,
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
        businessVerificationStatus: BusinessVerificationStatus.REJECTED,
        verificationNote: reason.trim(),
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

  /** Providers the user created or is assigned to administer. */
  listForUser(userId: string) {
    return this.prisma.serviceProvider
      .findMany({
        where: {
          OR: [
            { createdById: userId },
            { admins: { some: { userId } } },
          ],
        },
        include: providerInclude,
        orderBy: { createdAt: 'desc' },
      })
      .then((rows) => rows.map((row) => this.sanitize(row)));
  }

  private async assertUserOwnsProvider(userId: string, providerId: string) {
    const provider = await this.prisma.serviceProvider.findFirst({
      where: {
        id: providerId,
        OR: [
          { createdById: userId },
          { admins: { some: { userId } } },
        ],
      },
      include: providerInclude,
    });
    if (!provider) throw new NotFoundException('Service provider not found');
    return provider;
  }

  async findOneForUser(userId: string, id: string) {
    const provider = await this.assertUserOwnsProvider(userId, id);
    return this.sanitize(provider);
  }

  private async resolveStateIdForUser(
    userId: string,
    stateId?: string,
    locationLabel?: string,
    city?: string,
  ) {
    if (stateId) {
      const state = await this.prisma.state.findFirst({
        where: { id: stateId, isActive: true },
      });
      if (!state) throw new BadRequestException('State not found');
      return state.id;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stateId: true },
    });
    if (user?.stateId) return user.stateId;

    const haystack = `${locationLabel || ''} ${city || ''}`.toLowerCase();
    if (haystack.trim()) {
      const states = await this.prisma.state.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
      });
      const match = states.find(
        (s) =>
          haystack.includes(s.name.toLowerCase()) ||
          (s.code && haystack.includes(s.code.toLowerCase())),
      );
      if (match) return match.id;
    }

    throw new BadRequestException(
      'Could not determine state. Update your profile state or include a clear state in the location.',
    );
  }

  async createForUser(
    userId: string,
    data: {
      name: string;
      categoryId: string;
      subcategoryId?: string;
      description?: string;
      phone?: string;
      landline?: string;
      email?: string;
      address?: string;
      city?: string;
      stateId?: string;
      latitude?: number;
      longitude?: number;
      googlePlaceId?: string;
      about?: string;
      services?: string;
      coverPhotoUrl?: string;
      gallery?: string[];
      locationLabel?: string;
    },
  ) {
    await this.assertCategoryLinks(data.categoryId, data.subcategoryId);
    const resolvedStateId = await this.resolveStateIdForUser(
      userId,
      data.stateId,
      data.locationLabel,
      data.city,
    );

    const provider = await this.prisma.serviceProvider.create({
      data: {
        name: data.name.trim(),
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        description: data.description?.trim() || null,
        phone: data.phone?.trim() || null,
        landline: data.landline?.trim() || null,
        email: data.email?.trim().toLowerCase() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        stateId: resolvedStateId,
        latitude: data.latitude,
        longitude: data.longitude,
        googlePlaceId: data.googlePlaceId?.trim() || null,
        about: data.about?.trim() || null,
        services: data.services?.trim() || null,
        coverPhotoUrl: data.coverPhotoUrl?.trim() || null,
        gallery: data.gallery || [],
        isActive: true,
        approvalStatus: ProviderApprovalStatus.PENDING_APPROVAL,
        createdById: userId,
      },
      include: providerInclude,
    });

    return this.sanitize(provider);
  }

  async updateForUser(
    userId: string,
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      subcategoryId?: string | null;
      description?: string;
      phone?: string;
      landline?: string;
      email?: string;
      address?: string;
      city?: string;
      stateId?: string;
      latitude?: number;
      longitude?: number;
      googlePlaceId?: string;
      about?: string;
      services?: string;
      coverPhotoUrl?: string | null;
      gallery?: string[];
      locationLabel?: string;
    },
  ) {
    const existing = await this.assertUserOwnsProvider(userId, id);
    const nextCategoryId = data.categoryId ?? existing.categoryId;
    const nextSubcategoryId =
      data.subcategoryId === undefined ? existing.subcategoryId : data.subcategoryId;
    await this.assertCategoryLinks(nextCategoryId, nextSubcategoryId);

    let nextStateId = existing.stateId;
    if (
      data.stateId !== undefined ||
      data.locationLabel !== undefined ||
      data.city !== undefined
    ) {
      nextStateId = await this.resolveStateIdForUser(
        userId,
        data.stateId || existing.stateId,
        data.locationLabel,
        data.city,
      );
    }

    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
        ...(data.landline !== undefined && { landline: data.landline?.trim() || null }),
        ...(data.email !== undefined && {
          email: data.email?.trim().toLowerCase() || null,
        }),
        ...(data.address !== undefined && { address: data.address?.trim() || null }),
        ...(data.city !== undefined && { city: data.city?.trim() || null }),
        stateId: nextStateId,
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.googlePlaceId !== undefined && {
          googlePlaceId: data.googlePlaceId?.trim() || null,
        }),
        ...(data.about !== undefined && { about: data.about?.trim() || null }),
        ...(data.services !== undefined && { services: data.services?.trim() || null }),
        ...(data.coverPhotoUrl !== undefined && {
          coverPhotoUrl: data.coverPhotoUrl?.trim() || null,
        }),
        ...(data.gallery !== undefined && { gallery: data.gallery }),
        // Edits go back to pending review unless already rejected stays rejected? Plan: resubmit to pending
        approvalStatus: ProviderApprovalStatus.PENDING_APPROVAL,
        approvedById: null,
        approvedAt: null,
        rejectedReason: null,
        isActive: true,
      },
      include: providerInclude,
    });

    return this.sanitize(provider);
  }

  async removeForUser(userId: string, id: string) {
    await this.assertUserOwnsProvider(userId, id);
    await this.prisma.serviceProvider.delete({ where: { id } });
    return { id, deleted: true };
  }

  async submitBusinessVerificationForUser(
    userId: string,
    id: string,
    data: {
      mcaId?: string;
      din?: string;
      gstin?: string;
      nmcId?: string;
      panId?: string;
    },
  ) {
    const existing = await this.assertUserOwnsProvider(userId, id);
    if (existing.businessVerificationStatus === BusinessVerificationStatus.VERIFIED) {
      throw new BadRequestException('Business is already verified');
    }

    const mcaId = data.mcaId?.trim().toUpperCase() || null;
    const din = data.din?.trim().toUpperCase() || null;
    const gstin = data.gstin?.trim().toUpperCase() || null;
    const nmcId = data.nmcId?.trim().toUpperCase() || null;
    const panId = data.panId?.trim().toUpperCase() || null;

    if (!mcaId && !din && !gstin && !nmcId && !panId) {
      throw new BadRequestException(
        'Provide at least one of MCA ID, DIN, GSTIN, NMC ID, or PAN',
      );
    }

    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      throw new BadRequestException('Invalid GSTIN format');
    }
    if (panId && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panId)) {
      throw new BadRequestException('Invalid PAN format');
    }

    const provider = await this.prisma.serviceProvider.update({
      where: { id },
      data: {
        mcaId,
        din,
        gstin,
        nmcId,
        panId,
        businessVerificationStatus: BusinessVerificationStatus.IN_PROGRESS,
        verificationSubmittedAt: new Date(),
        verificationNote: null,
        // Keep listing in pending review until admin Approve
        approvalStatus: ProviderApprovalStatus.PENDING_APPROVAL,
        rejectedReason: null,
        isActive: true,
      },
      include: providerInclude,
    });

    return this.sanitize(provider);
  }
}
