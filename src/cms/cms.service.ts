import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CmsModel =
  | 'faq'
  | 'usefulLink'
  | 'socialSetting'
  | 'helpTicket'
  | 'cmsPage'
  | 'blog'
  | 'jobAlert'
  | 'suggestion'
  | 'volunteer'
  | 'marketplaceProduct'
  | 'marketplaceParty';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  private client(model: CmsModel) {
    return this.prisma[model] as unknown as {
      findMany: (args: object) => Promise<Record<string, unknown>[]>;
      findUnique: (args: object) => Promise<Record<string, unknown> | null>;
      create: (args: object) => Promise<Record<string, unknown>>;
      update: (args: object) => Promise<Record<string, unknown>>;
      delete: (args: object) => Promise<Record<string, unknown>>;
    };
  }

  async findAll(
    model: CmsModel,
    search?: string,
    searchFields: string[] = ['title', 'name'],
    extraWhere: Record<string, unknown> = {},
  ) {
    const where: Record<string, unknown> = { ...extraWhere };
    if (search?.trim()) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search.trim(), mode: Prisma.QueryMode.insensitive },
      }));
    }
    return this.client(model).findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findJobAlerts(filters: {
    search?: string;
    isActive?: boolean;
    postFrom?: string;
    postTo?: string;
    closeFrom?: string;
    closeTo?: string;
  }) {
    const where: Prisma.JobAlertWhereInput = {};

    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    const startsAt: Prisma.DateTimeFilter = {};
    if (filters.postFrom) startsAt.gte = new Date(`${filters.postFrom}T00:00:00.000Z`);
    if (filters.postTo) startsAt.lte = new Date(`${filters.postTo}T23:59:59.999Z`);
    if (Object.keys(startsAt).length) where.startsAt = startsAt;

    const endsAt: Prisma.DateTimeFilter = {};
    if (filters.closeFrom) endsAt.gte = new Date(`${filters.closeFrom}T00:00:00.000Z`);
    if (filters.closeTo) endsAt.lte = new Date(`${filters.closeTo}T23:59:59.999Z`);
    if (Object.keys(endsAt).length) where.endsAt = endsAt;

    return this.prisma.jobAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(model: CmsModel, id: string) {
    const row = await this.client(model).findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Record not found');
    return row;
  }

  create(model: CmsModel, data: Record<string, unknown>) {
    return this.client(model).create({ data });
  }

  async update(model: CmsModel, id: string, data: Record<string, unknown>) {
    await this.findOne(model, id);
    return this.client(model).update({ where: { id }, data });
  }

  async remove(model: CmsModel, id: string) {
    await this.findOne(model, id);
    return this.client(model).delete({ where: { id } });
  }
}
