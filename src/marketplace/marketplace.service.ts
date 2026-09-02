import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const adminProductInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  listAdmin(search?: string, listingIntent?: string) {
    const where: Prisma.MarketplaceProductWhereInput = {};
    const intent = listingIntent?.trim().toLowerCase();
    if (intent === 'buy' || intent === 'sell') {
      where.listingIntent = intent;
    }
    if (search?.trim()) {
      const q = search.trim();
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
    return this.prisma.marketplaceProduct.findMany({
      where,
      include: adminProductInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAdmin(id: string) {
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id },
      include: adminProductInclude,
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  createAdmin(data: {
    name: string;
    actualPrice?: string;
    offerPrice?: string;
    phone?: string;
    listingIntent?: string;
    sellerName?: string;
    description?: string;
    address?: string;
    color?: string;
    brand?: string;
    features?: string;
    location?: string;
    gallery?: string[];
    isActive?: boolean;
  }) {
    const intent = (data.listingIntent || 'sell').toLowerCase();
    return this.prisma.marketplaceProduct.create({
      data: {
        name: data.name.trim(),
        actualPrice: data.actualPrice,
        offerPrice: data.offerPrice,
        phone: data.phone,
        listingIntent: intent === 'buy' ? 'buy' : 'sell',
        sellerName: data.sellerName,
        description: data.description,
        address: data.address,
        color: data.color,
        brand: data.brand,
        features: data.features,
        location: data.location,
        gallery: data.gallery || [],
        isActive: data.isActive ?? true,
      },
      include: adminProductInclude,
    });
  }

  async updateAdmin(
    id: string,
    data: Partial<{
      name: string;
      actualPrice: string;
      offerPrice: string;
      phone: string;
      listingIntent: string;
      sellerName: string;
      description: string;
      address: string;
      color: string;
      brand: string;
      features: string;
      location: string;
      gallery: string[];
      isActive: boolean;
    }>,
  ) {
    await this.findAdmin(id);
    const payload = { ...data };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.listingIntent) {
      const intent = payload.listingIntent.toLowerCase();
      payload.listingIntent = intent === 'buy' ? 'buy' : 'sell';
    }
    return this.prisma.marketplaceProduct.update({
      where: { id },
      data: payload,
      include: adminProductInclude,
    });
  }

  async removeAdmin(id: string) {
    await this.findAdmin(id);
    return this.prisma.marketplaceProduct.delete({ where: { id } });
  }

  listPublic(search?: string) {
    const where: Prisma.MarketplaceProductWhereInput = { isActive: true };
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
        { brand: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    return this.prisma.marketplaceProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic(id: string) {
    const product = await this.prisma.marketplaceProduct.findFirst({
      where: { id, isActive: true },
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

  createForUser(
    userId: string,
    sellerName: string | null | undefined,
    data: {
      name: string;
      actualPrice?: string;
      offerPrice?: string;
      phone?: string;
      listingIntent?: string;
      description?: string;
      address?: string;
      color?: string;
      brand?: string;
      features?: string;
      location?: string;
      gallery?: string[];
    },
  ) {
    const intent = (data.listingIntent || 'sell').toLowerCase();
    return this.prisma.marketplaceProduct.create({
      data: {
        name: data.name.trim(),
        actualPrice: data.actualPrice,
        offerPrice: data.offerPrice,
        phone: data.phone,
        listingIntent: intent === 'buy' ? 'buy' : 'sell',
        sellerName: sellerName || undefined,
        description: data.description,
        address: data.address,
        color: data.color,
        brand: data.brand,
        features: data.features,
        location: data.location,
        gallery: data.gallery || [],
        createdById: userId,
        isActive: true,
      },
    });
  }
}
