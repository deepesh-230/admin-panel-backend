import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

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
