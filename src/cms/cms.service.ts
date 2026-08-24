import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CmsModel =
  | 'faq'
  | 'usefulLink'
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

  async broadcastLink(id: string) {
    await this.findOne('usefulLink', id);
    return this.client('usefulLink').update({
      where: { id },
      data: { broadcastAt: new Date() },
    });
  }
}
