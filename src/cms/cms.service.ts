import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BroadcastContentType,
  HelpTicketAuthor,
  HelpTicketStatus,
  Prisma,
  RoleName,
} from '@prisma/client';
import { sanitizeCoverage } from '../common/coverage';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { assignedStateIds } from '../common/utils/state-scope';
import { CreatePublicHelpTicketDto } from '../public/dto/create-public-help-ticket.dto';
import { PushService } from '../push/push.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHelpTicketDto } from './dto/update-help-ticket.dto';

const helpTicketMessageSelect = {
  id: true,
  author: true,
  body: true,
  createdAt: true,
} satisfies Prisma.HelpTicketMessageSelect;

const helpTicketMessagesAsc = {
  orderBy: { createdAt: 'asc' as const },
  select: helpTicketMessageSelect,
};

const helpTicketViewSelect = {
  id: true,
  ticketNo: true,
  userId: true,
  name: true,
  email: true,
  phone: true,
  message: true,
  status: true,
  reply: true,
  repliedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HelpTicketSelect;

export type CmsModel =
  | 'faq'
  | 'usefulLink'
  | 'socialSetting'
  | 'helpTicket'
  | 'cmsPage'
  | 'blog'
  | 'homeBanner'
  | 'jobAlert'
  | 'suggestion'
  | 'volunteer'
  | 'marketplaceProduct'
  | 'marketplaceParty';

@Injectable()
export class CmsService {
  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

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
        [field]: {
          contains: search.trim(),
          mode: Prisma.QueryMode.insensitive,
        },
      }));
    }
    if (model === 'homeBanner') {
      return this.prisma.homeBanner.findMany({
        where,
        include: {
          coverageState: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    }
    return this.client(model).findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findHelpTickets(search: string | undefined, currentUser: AuthUser) {
    const where: Prisma.HelpTicketWhereInput = {};
    if (currentUser.role === RoleName.STATE_ADMIN) {
      const ids = assignedStateIds(currentUser);
      if (!ids.length) {
        where.userId = '__none__';
      } else {
        where.user = {
          OR: [
            { stateId: { in: ids } },
            { userStates: { some: { stateId: { in: ids } } } },
          ],
        };
      }
    }
    const q = search?.trim();
    if (q) {
      where.AND = [
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { message: { contains: q, mode: 'insensitive' } },
            { reply: { contains: q, mode: 'insensitive' } },
            ...(/^\d+$/.test(q.replace(/^DD-/i, ''))
              ? [{ ticketNo: Number(q.replace(/^DD-/i, '')) }]
              : []),
          ],
        },
      ];
    }
    return this.prisma.helpTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: helpTicketViewSelect,
    });
  }

  async listHelpTicketsForUser(userId: string) {
    const rows = await this.prisma.helpTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...helpTicketViewSelect,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: helpTicketMessageSelect,
        },
      },
    });
    return rows.map(({ messages, ...ticket }) => ({
      ...ticket,
      latestMessage: messages[0] ?? null,
    }));
  }

  async getHelpTicketForUser(id: string, userId: string) {
    const row = await this.prisma.helpTicket.findFirst({
      where: { id, userId },
      select: {
        ...helpTicketViewSelect,
        messages: helpTicketMessagesAsc,
      },
    });
    if (!row) throw new NotFoundException('Record not found');
    return row;
  }

  async addHelpTicketUserMessage(id: string, userId: string, body: string) {
    const text = body.trim();
    if (!text) throw new BadRequestException('Enter a message');
    const ticket = await this.prisma.helpTicket.findFirst({
      where: { id, userId },
      select: { id: true, status: true },
    });
    if (!ticket) throw new NotFoundException('Record not found');
    if (ticket.status === HelpTicketStatus.CLOSED) {
      throw new BadRequestException('This ticket is closed');
    }
    await this.prisma.helpTicketMessage.create({
      data: {
        ticketId: id,
        author: HelpTicketAuthor.USER,
        body: text,
      },
    });
    return this.getHelpTicketForUser(id, userId);
  }

  async createHelpTicket(dto: CreatePublicHelpTicketDto, userId?: string | null) {
    const email = dto.email.trim().toLowerCase();
    const message = dto.message.trim();
    let ownerId = userId?.trim() || null;
    if (!ownerId) {
      const matched = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      ownerId = matched?.id ?? null;
    }
    return this.prisma.helpTicket.create({
      data: {
        userId: ownerId,
        name: dto.name.trim(),
        email,
        phone: dto.phone.trim(),
        message,
        status: HelpTicketStatus.OPEN,
        messages: {
          create: {
            author: HelpTicketAuthor.USER,
            body: message,
          },
        },
      },
      select: {
        ...helpTicketViewSelect,
        messages: helpTicketMessagesAsc,
      },
    });
  }

  async getHelpTicket(id: string, currentUser: AuthUser) {
    const row = await this.findHelpTicketOrThrow(id);
    this.assertHelpTicketScope(currentUser, row.user);
    return this.toHelpTicketView(row);
  }

  async updateHelpTicket(
    id: string,
    dto: UpdateHelpTicketDto,
    currentUser: AuthUser,
  ) {
    const nextReply = dto.reply?.trim() || '';
    if (dto.status === undefined && !nextReply) {
      throw new BadRequestException('Nothing to update');
    }
    const existing = await this.findHelpTicketOrThrow(id);
    this.assertHelpTicketScope(currentUser, existing.user);

    const data: Prisma.HelpTicketUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (nextReply) {
      data.reply = nextReply;
      data.repliedAt = new Date();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (nextReply) {
        await tx.helpTicketMessage.create({
          data: {
            ticketId: id,
            author: HelpTicketAuthor.SUPPORT,
            body: nextReply,
          },
        });
      }
      return tx.helpTicket.update({
        where: { id },
        data,
        select: {
          ...helpTicketViewSelect,
          messages: helpTicketMessagesAsc,
        },
      });
    });

    const threadUrl = `/menu/help-tickets/${id}`;
    const closedNow =
      dto.status === HelpTicketStatus.CLOSED &&
      existing.status !== HelpTicketStatus.CLOSED;
    if (existing.userId && nextReply) {
      await this.push.notifyUserInbox(
        existing.userId,
        BroadcastContentType.HELP_TICKET,
        `Support replied · DD-${existing.ticketNo}`,
        nextReply.slice(0, 180),
        { ticketId: id },
        threadUrl,
      );
    } else if (existing.userId && closedNow) {
      await this.push.notifyUserInbox(
        existing.userId,
        BroadcastContentType.HELP_TICKET,
        `Help request closed · DD-${existing.ticketNo}`,
        `Your help request DD-${existing.ticketNo} has been closed.`,
        { ticketId: id },
        threadUrl,
      );
    }

    return updated;
  }

  async removeHelpTicket(id: string, currentUser: AuthUser) {
    const existing = await this.findHelpTicketOrThrow(id);
    this.assertHelpTicketScope(currentUser, existing.user);
    await this.prisma.helpTicket.delete({ where: { id } });
    return { id };
  }

  private async findHelpTicketOrThrow(id: string) {
    const row = await this.prisma.helpTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            stateId: true,
            userStates: { select: { stateId: true } },
          },
        },
        messages: helpTicketMessagesAsc,
      },
    });
    if (!row) throw new NotFoundException('Record not found');
    return row;
  }

  private toHelpTicketView(row: {
    id: string;
    ticketNo: number;
    userId: string | null;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: HelpTicketStatus;
    reply: string | null;
    repliedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    messages: {
      id: string;
      author: HelpTicketAuthor;
      body: string;
      createdAt: Date;
    }[];
  }) {
    return {
      id: row.id,
      ticketNo: row.ticketNo,
      userId: row.userId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      status: row.status,
      reply: row.reply,
      repliedAt: row.repliedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      messages: row.messages,
    };
  }

  private assertHelpTicketScope(
    currentUser: AuthUser,
    owner: { stateId: string | null; userStates: { stateId: string }[] } | null,
  ) {
    if (currentUser.role !== RoleName.STATE_ADMIN) return;
    const assigned = assignedStateIds(currentUser);
    const recordStates = [
      owner?.stateId,
      ...(owner?.userStates.map((row) => row.stateId) ?? []),
    ];
    if (
      !recordStates.some(
        (stateId) => Boolean(stateId) && assigned.includes(stateId as string),
      )
    ) {
      throw new ForbiddenException(
        'You can only access records in your assigned state',
      );
    }
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
    if (filters.postFrom)
      startsAt.gte = new Date(`${filters.postFrom}T00:00:00.000Z`);
    if (filters.postTo)
      startsAt.lte = new Date(`${filters.postTo}T23:59:59.999Z`);
    if (Object.keys(startsAt).length) where.startsAt = startsAt;

    const endsAt: Prisma.DateTimeFilter = {};
    if (filters.closeFrom)
      endsAt.gte = new Date(`${filters.closeFrom}T00:00:00.000Z`);
    if (filters.closeTo)
      endsAt.lte = new Date(`${filters.closeTo}T23:59:59.999Z`);
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

  private asUrlList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [
      ...new Set(
        value.map((item) => String(item ?? '').trim()).filter(Boolean),
      ),
    ];
  }

  private sanitizeBlogData(data: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...data };

    if ('additionalLinks' in data) {
      out.additionalLinks = this.asUrlList(data.additionalLinks);
    }

    if ('images' in data) {
      const images = this.asUrlList(data.images);
      out.images = images;
      if (!('image' in data) || !String(data.image || '').trim()) {
        out.image = images[0] || null;
      }
    } else if ('image' in data) {
      const image = String(data.image || '').trim();
      out.image = image || null;
      if (image) out.images = [image];
      else if (!('images' in out)) out.images = [];
    }

    return out;
  }

  create(model: CmsModel, data: Record<string, unknown>) {
    const payload = model === 'blog' ? this.sanitizeBlogData(data) : data;
    return this.client(model).create({ data: payload });
  }

  async update(model: CmsModel, id: string, data: Record<string, unknown>) {
    await this.findOne(model, id);
    const payload = model === 'blog' ? this.sanitizeBlogData(data) : data;
    return this.client(model).update({ where: { id }, data: payload });
  }

  async remove(model: CmsModel, id: string) {
    await this.findOne(model, id);
    return this.client(model).delete({ where: { id } });
  }

  private bannerInclude = {
    coverageState: { select: { id: true, name: true, code: true } },
  } as const;

  private async buildBannerData(body: Record<string, unknown>) {
    let coverage;
    try {
      coverage = sanitizeCoverage({
        coverageFlag: body.coverageFlag as string | undefined,
        coverageStateId: body.coverageStateId as string | undefined,
        coverageCity: body.coverageCity as string | undefined,
      });
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid coverage',
      );
    }

    if (coverage.coverageStateId) {
      const state = await this.prisma.state.findUnique({
        where: { id: coverage.coverageStateId },
      });
      if (!state) throw new BadRequestException('Coverage state not found');
    }

    const image = String(body.image || '').trim();
    if (!image) throw new BadRequestException('Banner image is required');

    const sortOrder = Number(body.sortOrder ?? 0);
    if (!Number.isInteger(sortOrder)) {
      throw new BadRequestException('Sort order must be an integer');
    }

    return {
      title: body.title != null ? String(body.title).trim() || null : null,
      image,
      url: body.url != null ? String(body.url).trim() || null : null,
      sortOrder,
      isActive: body.isActive !== false && body.isActive !== 'false',
      ...coverage,
    };
  }

  async createHomeBanner(body: Record<string, unknown>) {
    const data = await this.buildBannerData(body);
    return this.prisma.homeBanner.create({
      data,
      include: this.bannerInclude,
    });
  }

  async updateHomeBanner(id: string, body: Record<string, unknown>) {
    const existing = await this.prisma.homeBanner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Record not found');
    const data = await this.buildBannerData({
      title: body.title !== undefined ? body.title : existing.title,
      image: body.image !== undefined ? body.image : existing.image,
      url: body.url !== undefined ? body.url : existing.url,
      sortOrder:
        body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      coverageFlag:
        body.coverageFlag !== undefined
          ? body.coverageFlag
          : existing.coverageFlag,
      coverageStateId:
        body.coverageStateId !== undefined
          ? body.coverageStateId
          : existing.coverageStateId,
      coverageCity:
        body.coverageCity !== undefined
          ? body.coverageCity
          : existing.coverageCity,
    });
    return this.prisma.homeBanner.update({
      where: { id },
      data,
      include: this.bannerInclude,
    });
  }
}
