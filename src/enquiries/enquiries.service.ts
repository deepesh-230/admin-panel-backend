import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnquiryStatus, Prisma, RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from './dto/enquiry.dto';

const enquiryInclude = {
  provider: { select: { id: true, name: true, stateId: true } },
  state: { select: { id: true, name: true, code: true } },
} as const;

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    currentUser: AuthUser,
    searchQuery?: string,
    kind?: string,
    status?: EnquiryStatus,
  ) {
    const where: Prisma.EnquiryWhereInput = {
      AND: [await this.scopeWhere(currentUser)],
    };

    if (kind) {
      (where.AND as Prisma.EnquiryWhereInput[]).push({ kind });
    }
    if (status) {
      (where.AND as Prisma.EnquiryWhereInput[]).push({ status });
    }
    if (searchQuery) {
      (where.AND as Prisma.EnquiryWhereInput[]).push({
        OR: [
          { product: { contains: searchQuery, mode: 'insensitive' } },
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { category: { contains: searchQuery, mode: 'insensitive' } },
        ],
      });
    }

    return this.prisma.enquiry.findMany({
      where,
      include: enquiryInclude,
      orderBy: { sNo: 'asc' },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id },
      include: enquiryInclude,
    });
    if (!enquiry) throw new NotFoundException(`Enquiry with ID ${id} not found`);
    await this.assertCanAccess(currentUser, enquiry);
    return enquiry;
  }

  async create(currentUser: AuthUser, data: CreateEnquiryDto) {
    const resolved = await this.resolveWriteFields(currentUser, data);
    const last = await this.prisma.enquiry.findFirst({ orderBy: { sNo: 'desc' } });
    const nextSNo = (last?.sNo ?? 0) + 1;
    return this.prisma.enquiry.create({
      data: {
        category: data.category,
        subCategory: data.subCategory,
        product: data.product,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        date: data.date,
        createdBy: data.createdBy,
        kind: resolved.kind,
        status: data.status ?? EnquiryStatus.NEW,
        providerId: resolved.providerId,
        stateId: resolved.stateId,
        marketplaceProductId: data.marketplaceProductId,
        sNo: nextSNo,
      },
      include: enquiryInclude,
    });
  }

  async update(id: string, currentUser: AuthUser, data: UpdateEnquiryDto) {
    const existing = await this.findOne(id, currentUser);
    const resolved = await this.resolveWriteFields(currentUser, {
      kind: data.kind ?? existing.kind,
      providerId: data.providerId !== undefined ? data.providerId : existing.providerId ?? undefined,
      stateId: data.stateId !== undefined ? data.stateId : existing.stateId ?? undefined,
    });

    return this.prisma.enquiry.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
        ...(data.product !== undefined && { product: data.product }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.createdBy !== undefined && { createdBy: data.createdBy }),
        ...(data.status !== undefined && { status: data.status }),
        kind: resolved.kind,
        providerId: resolved.providerId,
        stateId: resolved.stateId,
      },
      include: enquiryInclude,
    });
  }

  async remove(id: string, currentUser: AuthUser) {
    await this.findOne(id, currentUser);
    return this.prisma.enquiry.delete({ where: { id } });
  }

  private async scopeWhere(currentUser: AuthUser): Promise<Prisma.EnquiryWhereInput> {
    if (currentUser.role === RoleName.ADMIN) return {};

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (!currentUser.stateId) return { id: { in: [] } };
      return { stateId: currentUser.stateId };
    }

    if (currentUser.role === RoleName.SERVICE_PROVIDER_ADMIN) {
      const ids = await this.assignedProviderIds(currentUser.id);
      return { providerId: { in: ids } };
    }

    if (currentUser.role === RoleName.VOLUNTEER) {
      return { kind: 'USER' };
    }

    return { id: { in: [] } };
  }

  private async assertCanAccess(
    currentUser: AuthUser,
    enquiry: { kind: string; providerId: string | null; stateId: string | null },
  ) {
    if (currentUser.role === RoleName.ADMIN) return;

    if (currentUser.role === RoleName.STATE_ADMIN) {
      if (!currentUser.stateId || enquiry.stateId !== currentUser.stateId) {
        throw new ForbiddenException('You can only access enquiries in your assigned state');
      }
      return;
    }

    if (currentUser.role === RoleName.SERVICE_PROVIDER_ADMIN) {
      const ids = await this.assignedProviderIds(currentUser.id);
      if (!enquiry.providerId || !ids.includes(enquiry.providerId)) {
        throw new ForbiddenException('You can only access enquiries for your assigned providers');
      }
      return;
    }

    if (currentUser.role === RoleName.VOLUNTEER) {
      if (enquiry.kind !== 'USER') {
        throw new ForbiddenException('Volunteers can only access user enquiries');
      }
      return;
    }

    throw new ForbiddenException('You cannot access this enquiry');
  }

  private async assignedProviderIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.serviceProviderAdmin.findMany({
      where: { userId },
      select: { serviceProviderId: true },
    });
    const ids = rows.map((r) => r.serviceProviderId);
    return ids.length ? ids : ['__none__'];
  }

  private async resolveWriteFields(
    currentUser: AuthUser,
    data: { kind?: string; providerId?: string | null; stateId?: string | null },
  ) {
    let kind = data.kind || 'USER';
    let providerId = data.providerId || null;
    let stateId = data.stateId || null;

    if (currentUser.role === RoleName.VOLUNTEER) {
      kind = 'USER';
      providerId = null;
    }

    if (currentUser.role === RoleName.STATE_ADMIN) {
      stateId = currentUser.stateId ?? null;
    }

    if (currentUser.role === RoleName.SERVICE_PROVIDER_ADMIN) {
      const ids = await this.assignedProviderIds(currentUser.id);
      const usable = ids.filter((id) => id !== '__none__');
      if (!usable.length) {
        throw new ForbiddenException('No providers are assigned to this account');
      }
      if (!providerId) {
        if (usable.length === 1) providerId = usable[0];
        else throw new ForbiddenException('Select one of your assigned providers');
      }
      if (!usable.includes(providerId)) {
        throw new ForbiddenException('You can only attach enquiries to your assigned providers');
      }
    }

    if (providerId) {
      const provider = await this.prisma.serviceProvider.findUnique({
        where: { id: providerId },
        select: { id: true, stateId: true },
      });
      if (!provider) throw new NotFoundException('Service provider not found');
      stateId = provider.stateId;
    }

    return { kind, providerId, stateId };
  }
}
