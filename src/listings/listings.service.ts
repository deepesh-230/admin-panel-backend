import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(searchQuery?: string) {
    if (searchQuery) {
      return this.prisma.listing.findMany({
        where: {
          OR: [
            { product: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        orderBy: { sNo: 'asc' },
      });
    }
    return this.prisma.listing.findMany({ orderBy: { sNo: 'asc' } });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException(`Listing with ID ${id} not found`);
    return listing;
  }

  async create(data: {
    category: string;
    subCategory: string;
    product: string;
    email: string;
    image: string;
    createdBy: string;
    date: string;
    status?: boolean;
  }) {
    const last = await this.prisma.listing.findFirst({ orderBy: { sNo: 'desc' } });
    const nextSNo = (last?.sNo ?? 0) + 1;
    return this.prisma.listing.create({
      data: { ...data, sNo: nextSNo },
    });
  }

  async update(
    id: string,
    data: {
      category?: string;
      subCategory?: string;
      product?: string;
      email?: string;
      image?: string;
      createdBy?: string;
      date?: string;
      status?: boolean;
    },
  ) {
    await this.findOne(id);
    return this.prisma.listing.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: boolean) {
    await this.findOne(id);
    return this.prisma.listing.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.listing.delete({ where: { id } });
  }
}

