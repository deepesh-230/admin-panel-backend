import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminLifecycleFlag, CoverageFlag, RoleName } from '@prisma/client';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { sanitizeCoverage } from '../common/coverage';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

class SetFlagDto {
  @IsIn(['enquiry', 'suggestion', 'jobAlert', 'event', 'marketplaceProduct'])
  entity!: 'enquiry' | 'suggestion' | 'jobAlert' | 'event' | 'marketplaceProduct';

  @IsUUID()
  id!: string;

  @IsEnum(AdminLifecycleFlag)
  flag!: AdminLifecycleFlag;
}

class CreateEventDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  startsAt!: string;

  @IsOptional()
  @IsString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  registrationLink?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  coverageFlag?: string;

  @IsOptional()
  @IsString()
  coverageStateId?: string | null;

  @IsOptional()
  @IsString()
  coverageCity?: string | null;
}

class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  startsAt?: string;

  @IsOptional()
  @IsString()
  endsAt?: string | null;

  @IsOptional()
  @IsString()
  registrationLink?: string | null;

  @IsOptional()
  @IsString()
  contactInfo?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(AdminLifecycleFlag)
  adminFlag?: AdminLifecycleFlag;

  @IsOptional()
  @IsString()
  coverageFlag?: string;

  @IsOptional()
  @IsString()
  coverageStateId?: string | null;

  @IsOptional()
  @IsString()
  coverageCity?: string | null;
}

@Controller('dashboard')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
@Permissions('dashboard.read')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

  private eventInclude = {
    coverageState: { select: { id: true, name: true, code: true } },
  } as const;

  private async buildEventCoverage(input: {
    coverageFlag?: string | null;
    coverageStateId?: string | null;
    coverageCity?: string | null;
  }) {
    let coverage;
    try {
      coverage = sanitizeCoverage(input);
    } catch (e) {
      throw new BadRequestException(e instanceof Error ? e.message : 'Invalid coverage');
    }
    if (coverage.coverageStateId) {
      const state = await this.prisma.state.findUnique({
        where: { id: coverage.coverageStateId },
      });
      if (!state) throw new BadRequestException('Coverage state not found');
    }
    return coverage;
  }

  @Get('stats')
  getStats(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.dashboardService.getStats(user, { from, to });
  }

  @Post('purge-deleted')
  @Roles(RoleName.ADMIN)
  purgeDeleted() {
    return this.dashboardService.purgeDeleted(60);
  }

  @Post('backfill')
  @Roles(RoleName.ADMIN)
  backfill() {
    return this.dashboardService.backfill();
  }

  @Patch('flag')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  async setFlag(@Body() dto: SetFlagDto) {
    const deletedAt = dto.flag === AdminLifecycleFlag.DELETE ? new Date() : null;
    const data = { adminFlag: dto.flag, deletedAt };

    switch (dto.entity) {
      case 'enquiry':
        return this.prisma.enquiry.update({ where: { id: dto.id }, data });
      case 'suggestion':
        return this.prisma.suggestion.update({ where: { id: dto.id }, data });
      case 'jobAlert':
        return this.prisma.jobAlert.update({ where: { id: dto.id }, data });
      case 'event':
        return this.prisma.event.update({ where: { id: dto.id }, data });
      case 'marketplaceProduct':
        return this.prisma.marketplaceProduct.update({ where: { id: dto.id }, data });
      default:
        return { ok: false };
    }
  }

  @Get('events')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
  @Permissions('events.read')
  listEvents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('coverageFlag') coverageFlag?: string,
  ) {
    const now = new Date();
    const windowStart = from ? new Date(from) : now;
    const windowEnd = to ? new Date(to) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const flag = String(coverageFlag || '').trim().toUpperCase();
    const coverageWhere =
      flag === 'NATIONAL' || flag === 'STATE' || flag === 'LOCAL'
        ? { coverageFlag: flag as CoverageFlag }
        : {};
    return this.prisma.event.findMany({
      where: {
        adminFlag: { not: AdminLifecycleFlag.DELETE },
        deletedAt: null,
        startsAt: { lte: windowEnd },
        OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
        ...coverageWhere,
      },
      include: this.eventInclude,
      orderBy: { startsAt: 'asc' },
    });
  }

  @Post('events')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
  @Permissions('events.write')
  async createEvent(@Body() dto: CreateEventDto) {
    const coverage = await this.buildEventCoverage({
      coverageFlag: dto.coverageFlag,
      coverageStateId: dto.coverageStateId,
      coverageCity: dto.coverageCity,
    });
    return this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        location: dto.location?.trim() || null,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        registrationLink: dto.registrationLink?.trim() || null,
        contactInfo: dto.contactInfo?.trim() || null,
        isActive: dto.isActive ?? true,
        ...coverage,
      },
      include: this.eventInclude,
    });
  }

  @Patch('events/:id')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
  @Permissions('events.write')
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    const coverage = await this.buildEventCoverage({
      coverageFlag: dto.coverageFlag !== undefined ? dto.coverageFlag : existing.coverageFlag,
      coverageStateId:
        dto.coverageStateId !== undefined ? dto.coverageStateId : existing.coverageStateId,
      coverageCity: dto.coverageCity !== undefined ? dto.coverageCity : existing.coverageCity,
    });
    const deletedAt =
      dto.adminFlag === AdminLifecycleFlag.DELETE
        ? new Date()
        : dto.adminFlag
          ? null
          : undefined;
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
        ...(dto.location !== undefined && { location: dto.location?.trim() || null }),
        ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
        ...(dto.endsAt !== undefined && {
          endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        }),
        ...(dto.registrationLink !== undefined && {
          registrationLink: dto.registrationLink?.trim() || null,
        }),
        ...(dto.contactInfo !== undefined && {
          contactInfo: dto.contactInfo?.trim() || null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.adminFlag !== undefined && { adminFlag: dto.adminFlag }),
        ...(deletedAt !== undefined && { deletedAt }),
        ...coverage,
      },
      include: this.eventInclude,
    });
  }

  @Delete('events/:id')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
  @Permissions('events.write')
  async removeEvent(@Param('id') id: string) {
    await this.prisma.event.update({
      where: { id },
      data: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: new Date(), isActive: false },
    });
    return { id, deleted: true };
  }
}
