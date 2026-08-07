import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(searchQuery?: string) {
    if (searchQuery) {
      return this.prisma.enquiry.findMany({
        where: {
          OR: [
            { product: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        orderBy: { sNo: 'asc' },
      });
    }
    return this.prisma.enquiry.findMany({ orderBy: { sNo: 'asc' } });
  }

  async findOne(id: string) {
    const enquiry = await this.prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) throw new NotFoundException(`Enquiry with ID ${id} not found`);
    return enquiry;
  }

  async create(data: {
    category: string;
    subCategory: string;
    product: string;
    name?: string;
    email: string;
    date: string;
    createdBy: string;
  }) {
    const last = await this.prisma.enquiry.findFirst({ orderBy: { sNo: 'desc' } });
    const nextSNo = (last?.sNo ?? 0) + 1;
    return this.prisma.enquiry.create({
      data: { ...data, sNo: nextSNo },
    });
  }

  async update(
    id: string,
    data: {
      category?: string;
      subCategory?: string;
      product?: string;
      name?: string;
      email?: string;
      date?: string;
      createdBy?: string;
    },
  ) {
    await this.findOne(id);
    return this.prisma.enquiry.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.enquiry.delete({ where: { id } });
  }
}
