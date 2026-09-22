import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MarketplaceItemCondition,
  MarketplaceSaleStatus,
  Prisma,
  RoleName,
} from '@prisma/client';
import { boundingBox, haversineKm } from '../common/utils/geo';
import { PrismaService } from '../prisma/prisma.service';

const adminProductInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export type MarketplaceListQuery = {
  search?: string;
  listingIntent?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
};

type MarketplaceWriteInput = {
  name?: string;
  actualPrice?: string | null;
  offerPrice?: string | null;
  phone?: string | null;
  listingIntent?: string;
  condition?: string | null;
  quantity?: number;
  sellerName?: string | null;
  description?: string | null;
  address?: string | null;
  color?: string | null;
  brand?: string | null;
  features?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  gallery?: string[];
  isActive?: boolean;
  stateId?: string | null;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFlag?: 'READ' | 'ACTIVE' | 'DELETE';
  saleStatus?: MarketplaceSaleStatus;
};

function normalizeCondition(
  value?: string | null,
): MarketplaceItemCondition | null | undefined {
  if (value === null) return null;
  if (!value?.trim()) return undefined;
  const key = value.trim().toUpperCase();
  if (key === 'NEW' || key === 'USED' || key === 'FREE') {
    return key as MarketplaceItemCondition;
  }
  return undefined;
}

function parseOfferPriceValue(price?: string | null): number | null {
  if (!price?.trim()) return null;
  const cleaned = price.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function applySoldFromQuantity(
  quantity: number,
  current?: { saleStatus?: MarketplaceSaleStatus; soldAt?: Date | null },
): Partial<{
  quantity: number;
  saleStatus: MarketplaceSaleStatus;
  soldAt: Date | null;
}> {
  if (quantity > 0) {
    return { quantity };
  }
  return {
    quantity: 0,
    saleStatus: MarketplaceSaleStatus.SOLD,
    soldAt: current?.soldAt ?? new Date(),
  };
}

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  private buildPriceGeoWhere(query: MarketplaceListQuery): Prisma.MarketplaceProductWhereInput {
    const where: Prisma.MarketplaceProductWhereInput = {};
    const condition = normalizeCondition(query.condition);
    if (condition) where.condition = condition;

    // Price is applied in-memory (offerPriceValue may be null on older rows).
    // Geo bounding box here; haversine refines afterward.
    const hasGeo =
      query.latitude != null &&
      query.longitude != null &&
      query.radius != null &&
      query.radius > 0;
    if (hasGeo) {
      const box = boundingBox(query.latitude!, query.longitude!, query.radius!);
      where.latitude = { gte: box.minLat, lte: box.maxLat, not: null };
      where.longitude = { gte: box.minLng, lte: box.maxLng, not: null };
    }
    return where;
  }

  private applyPriceFilter<
    T extends { offerPrice?: string | null; offerPriceValue?: number | null },
  >(rows: T[], query: MarketplaceListQuery): T[] {
    if (query.minPrice == null && query.maxPrice == null) return rows;
    return rows.filter((row) => {
      const value =
        row.offerPriceValue != null && Number.isFinite(row.offerPriceValue)
          ? row.offerPriceValue
          : parseOfferPriceValue(row.offerPrice);
      if (value == null) return false;
      if (query.minPrice != null && value < query.minPrice) return false;
      if (query.maxPrice != null && value > query.maxPrice) return false;
      return true;
    });
  }

  private async applyHaversineFilter<
    T extends { id: string; latitude: number | null; longitude: number | null },
  >(
    rows: T[],
    query: MarketplaceListQuery,
  ): Promise<(T & { distanceKm?: number })[]> {
    const hasGeo =
      query.latitude != null &&
      query.longitude != null &&
      query.radius != null &&
      query.radius > 0;
    if (!hasGeo) return rows;
    const originLat = query.latitude!;
    const originLng = query.longitude!;
    const radiusKm = query.radius!;
    return rows
      .map((row) => {
        if (row.latitude == null || row.longitude == null) return null;
        const distanceKm = haversineKm(originLat, originLng, row.latitude, row.longitude);
        if (distanceKm > radiusKm) return null;
        return { ...row, distanceKm: Math.round(distanceKm * 100) / 100 };
      })
      .filter((row): row is T & { distanceKm: number } => row != null)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async listAdmin(query: MarketplaceListQuery = {}) {
    const where: Prisma.MarketplaceProductWhereInput = {
      ...this.buildPriceGeoWhere(query),
    };
    const intent = query.listingIntent?.trim().toLowerCase();
    if (intent === 'buy' || intent === 'sell') {
      where.listingIntent = intent;
    }
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sellerName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { createdBy: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const hasGeo =
      query.latitude != null &&
      query.longitude != null &&
      query.radius != null &&
      query.radius > 0;

    if (!query.page && !hasGeo) {
      const rows = await this.prisma.marketplaceProduct.findMany({
        where,
        include: adminProductInclude,
        orderBy: { createdAt: 'desc' },
      });
      return this.applyPriceFilter(rows, query);
    }

    const candidates = await this.prisma.marketplaceProduct.findMany({
      where,
      include: adminProductInclude,
      orderBy: { createdAt: 'desc' },
    });
    const priced = this.applyPriceFilter(candidates, query);
    const filtered = await this.applyHaversineFilter(priced, query);

    if (!query.page) return filtered;

    const take = Math.min(query.limit || 20, 100);
    const skip = (query.page - 1) * take;
    const items = filtered.slice(skip, skip + take);
    return {
      items,
      pagination: {
        page: query.page,
        limit: take,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / take) || 0,
      },
    };
  }

  async findAdmin(id: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id },
      include: adminProductInclude,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private buildCreateData(
    data: MarketplaceWriteInput,
    extras?: { createdById?: string; sellerName?: string | null; stateId?: string },
  ): Prisma.MarketplaceProductCreateInput {
    const intent = (data.listingIntent || 'sell').toLowerCase();
    const quantity = data.quantity ?? 1;
    const sold = applySoldFromQuantity(quantity);
    const offerPrice = data.offerPrice ?? undefined;
    let saleStatus =
      sold.saleStatus ??
      (data.approvalStatus === 'APPROVED'
        ? MarketplaceSaleStatus.PENDING_SALE
        : MarketplaceSaleStatus.NEWLY_ADDED);

    return {
      name: (data.name || '').trim(),
      actualPrice: data.actualPrice ?? undefined,
      offerPrice,
      previousOfferPrice: undefined,
      offerPriceValue: parseOfferPriceValue(offerPrice),
      phone: data.phone ?? undefined,
      listingIntent: intent === 'buy' ? 'buy' : 'sell',
      condition: normalizeCondition(data.condition) ?? undefined,
      quantity: sold.quantity ?? quantity,
      saleStatus,
      soldAt: sold.soldAt ?? undefined,
      sellerName: extras?.sellerName ?? data.sellerName ?? undefined,
      description: data.description ?? undefined,
      address: data.address ?? undefined,
      color: data.color ?? undefined,
      brand: data.brand ?? undefined,
      features: data.features ?? undefined,
      location: data.location ?? undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      gallery: data.gallery || [],
      isActive: data.isActive ?? true,
      approvalStatus: data.approvalStatus ?? 'PENDING',
      adminFlag: data.adminFlag ?? 'ACTIVE',
      ...(extras?.createdById
        ? { createdBy: { connect: { id: extras.createdById } } }
        : {}),
      ...(extras?.stateId || data.stateId
        ? { state: { connect: { id: (extras?.stateId || data.stateId)! } } }
        : {}),
    };
  }

  createAdmin(data: MarketplaceWriteInput & { name: string }) {
    return this.prisma.marketplaceProduct.create({
      data: {
        ...this.buildCreateData({
          ...data,
          approvalStatus: data.approvalStatus ?? 'APPROVED',
        }),
      },
      include: adminProductInclude,
    });
  }

  async updateAdmin(id: string, data: MarketplaceWriteInput) {
    const existing = await this.findAdmin(id);
    const payload = this.buildUpdatePayload(existing, data);
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: payload,
      include: adminProductInclude,
    });
  }

  private buildUpdatePayload(
    existing: {
      offerPrice: string | null;
      saleStatus: MarketplaceSaleStatus;
      soldAt: Date | null;
      quantity: number;
      approvalStatus: string;
    },
    data: MarketplaceWriteInput,
  ): Prisma.MarketplaceProductUpdateInput {
    const payload: Prisma.MarketplaceProductUpdateInput = {};

    if (typeof data.name === 'string') payload.name = data.name.trim();
    if (data.actualPrice !== undefined) payload.actualPrice = data.actualPrice;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.sellerName !== undefined) payload.sellerName = data.sellerName;
    if (data.description !== undefined) payload.description = data.description;
    if (data.address !== undefined) payload.address = data.address;
    if (data.color !== undefined) payload.color = data.color;
    if (data.brand !== undefined) payload.brand = data.brand;
    if (data.features !== undefined) payload.features = data.features;
    if (data.location !== undefined) payload.location = data.location;
    if (data.latitude !== undefined) payload.latitude = data.latitude;
    if (data.longitude !== undefined) payload.longitude = data.longitude;
    if (data.gallery !== undefined) payload.gallery = data.gallery;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.stateId !== undefined) {
      payload.state = data.stateId ? { connect: { id: data.stateId } } : { disconnect: true };
    }
    if (typeof data.listingIntent === 'string') {
      const intent = data.listingIntent.toLowerCase();
      payload.listingIntent = intent === 'buy' ? 'buy' : 'sell';
    }
    if ('condition' in data) {
      payload.condition =
        data.condition == null || data.condition === ''
          ? null
          : normalizeCondition(String(data.condition)) ?? null;
    }

    if (data.offerPrice !== undefined) {
      const next = data.offerPrice;
      const prev = existing.offerPrice;
      if (next != null && prev != null && next.trim() !== prev.trim()) {
        const nextN = parseOfferPriceValue(next);
        const prevN = parseOfferPriceValue(prev);
        if (
          nextN != null &&
          prevN != null &&
          prevN > nextN
        ) {
          payload.previousOfferPrice = prev;
        }
      }
      payload.offerPrice = next;
      payload.offerPriceValue = parseOfferPriceValue(next);
    }

    if (data.quantity !== undefined) {
      const sold = applySoldFromQuantity(data.quantity, existing);
      payload.quantity = sold.quantity;
      if (sold.saleStatus) payload.saleStatus = sold.saleStatus;
      if (sold.soldAt !== undefined) payload.soldAt = sold.soldAt;
    }

    if (data.approvalStatus !== undefined) {
      payload.approvalStatus = data.approvalStatus;
      if (
        data.approvalStatus === 'APPROVED' &&
        existing.saleStatus !== MarketplaceSaleStatus.SOLD &&
        data.saleStatus !== MarketplaceSaleStatus.SOLD &&
        data.quantity === undefined
      ) {
        payload.saleStatus = MarketplaceSaleStatus.PENDING_SALE;
      }
    }

    if (data.saleStatus !== undefined) {
      payload.saleStatus = data.saleStatus;
      if (data.saleStatus === MarketplaceSaleStatus.SOLD) {
        payload.soldAt = existing.soldAt ?? new Date();
        payload.quantity = 0;
      }
    }

    if (data.adminFlag === 'DELETE') {
      payload.adminFlag = 'DELETE';
      payload.deletedAt = new Date();
    } else if (data.adminFlag) {
      payload.adminFlag = data.adminFlag;
      payload.deletedAt = null;
    }

    return payload;
  }

  async removeAdmin(id: string) {
    const existing = await this.findAdmin(id);
    if (existing.saleStatus === MarketplaceSaleStatus.SOLD) {
      this.assertSoldRetention(RoleName.ADMIN, existing.soldAt);
    }
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: { adminFlag: 'DELETE', deletedAt: new Date(), isActive: false },
    });
  }

  async listPublic(query: MarketplaceListQuery = {}) {
    const normalized: MarketplaceListQuery = {
      ...query,
      minPrice: query.minPrice != null && Number.isFinite(Number(query.minPrice))
        ? Number(query.minPrice)
        : undefined,
      maxPrice: query.maxPrice != null && Number.isFinite(Number(query.maxPrice))
        ? Number(query.maxPrice)
        : undefined,
      latitude: query.latitude != null && Number.isFinite(Number(query.latitude))
        ? Number(query.latitude)
        : undefined,
      longitude: query.longitude != null && Number.isFinite(Number(query.longitude))
        ? Number(query.longitude)
        : undefined,
      radius: query.radius != null && Number.isFinite(Number(query.radius))
        ? Number(query.radius)
        : undefined,
    };

    if (
      (normalized.latitude != null ||
        normalized.longitude != null ||
        normalized.radius != null) &&
      (normalized.latitude == null ||
        normalized.longitude == null ||
        normalized.radius == null)
    ) {
      throw new BadRequestException(
        'latitude, longitude, and radius are all required for nearby search',
      );
    }
    if (
      normalized.radius != null &&
      (normalized.radius < 0.1 || normalized.radius > 100)
    ) {
      throw new BadRequestException('radius must be between 0.1 and 100 km');
    }

    const where: Prisma.MarketplaceProductWhereInput = {
      isActive: true,
      deletedAt: null,
      adminFlag: { not: 'DELETE' },
      approvalStatus: { in: ['APPROVED', 'PENDING'] },
      saleStatus: { in: [MarketplaceSaleStatus.NEWLY_ADDED, MarketplaceSaleStatus.PENDING_SALE] },
      ...this.buildPriceGeoWhere(normalized),
    };

    if (normalized.search?.trim()) {
      const q = normalized.search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const rows = await this.prisma.marketplaceProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const priced = this.applyPriceFilter(rows, normalized);
    return this.applyHaversineFilter(priced, normalized);
  }

  async findPublic(id: string) {
    const product = await this.prisma.marketplaceProduct.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
        adminFlag: { not: 'DELETE' },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  listForUser(userId: string) {
    return this.prisma.marketplaceProduct.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForUser(userId: string, id: string) {
    const product = await this.prisma.marketplaceProduct.findFirst({
      where: { id, createdById: userId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createForUser(
    userId: string,
    sellerName: string | null | undefined,
    data: MarketplaceWriteInput & { name: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stateId: true },
    });
    return this.prisma.marketplaceProduct.create({
      data: this.buildCreateData(data, {
        createdById: userId,
        sellerName: sellerName || undefined,
        stateId: data.stateId || user?.stateId || undefined,
      }),
    });
  }

  async updateForUser(userId: string, id: string, data: MarketplaceWriteInput) {
    const existing = await this.findForUser(userId, id);
    const payload = this.buildUpdatePayload(existing, data);
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: payload,
    });
  }

  async markSoldForUser(userId: string, id: string) {
    await this.findForUser(userId, id);
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: {
        saleStatus: MarketplaceSaleStatus.SOLD,
        soldAt: new Date(),
        quantity: 0,
      },
    });
  }

  private assertSoldRetention(
    role: RoleName | string,
    soldAt: Date | null,
  ) {
    if (!soldAt) {
      throw new ForbiddenException('Only sold items can be deleted after the retention period');
    }
    const days = role === RoleName.END_USER ? 30 : 180;
    const elapsedMs = Date.now() - soldAt.getTime();
    const requiredMs = days * 24 * 60 * 60 * 1000;
    if (elapsedMs < requiredMs) {
      throw new ForbiddenException(
        `Sold items can be deleted only after ${days} days`,
      );
    }
  }

  async removeForUser(userId: string, id: string, role: RoleName | string) {
    const existing = await this.findForUser(userId, id);
    if (existing.saleStatus !== MarketplaceSaleStatus.SOLD) {
      // Allow deleting non-sold own drafts immediately via soft-delete
      return this.prisma.marketplaceProduct.update({
        where: { id },
        data: { adminFlag: 'DELETE', deletedAt: new Date(), isActive: false },
      });
    }
    this.assertSoldRetention(role, existing.soldAt);
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: { adminFlag: 'DELETE', deletedAt: new Date(), isActive: false },
    });
  }
}
