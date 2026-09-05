import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminLifecycleFlag, RoleName } from '@prisma/client';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
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
  @IsBoolean()
  isActive?: boolean;
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
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(AdminLifecycleFlag)
  adminFlag?: AdminLifecycleFlag;
}

@Controller('dashboard')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
@Permissions('dashboard.read')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService,
  ) {}

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
  listEvents(@Query('from') from?: string, @Query('to') to?: string) {
    const now = new Date();
    const windowStart = from ? new Date(from) : now;
    const windowEnd = to ? new Date(to) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.prisma.event.findMany({
      where: {
        adminFlag: { not: AdminLifecycleFlag.DELETE },
        deletedAt: null,
        startsAt: { lte: windowEnd },
        OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  @Post('events')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  createEvent(@Body() dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  @Patch('events/:id')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
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
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
        ...(dto.endsAt !== undefined && {
          endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.adminFlag !== undefined && { adminFlag: dto.adminFlag }),
        ...(deletedAt !== undefined && { deletedAt }),
      },
    });
  }

  @Delete('events/:id')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  async removeEvent(@Param('id') id: string) {
    await this.prisma.event.update({
      where: { id },
      data: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: new Date(), isActive: false },
    });
    return { id, deleted: true };
  }
}
