import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BroadcastsService } from '../cms/broadcasts.service';
import { CreateMarketplaceProductDto } from './dto/create-marketplace-product.dto';
import {
  CreateMyServiceProviderDto,
  UpdateMyServiceProviderDto,
} from './dto/my-service-provider.dto';
import { SubmitBusinessVerificationDto } from './dto/submit-business-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolveDigipinFields } from '../common/digipin.util';

@Controller('profile')
@Roles(
  RoleName.END_USER,
  RoleName.ADMIN,
  RoleName.VOLUNTEER,
  RoleName.SERVICE_PROVIDER_ADMIN,
)
export class ProfileController {
  constructor(
    private readonly marketplace: MarketplaceService,
    private readonly serviceProviders: ServiceProvidersService,
    private readonly prisma: PrismaService,
    private readonly broadcasts: BroadcastsService,
  ) {}

  @Patch()
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  async updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    const shouldRecomputeDigipin = dto.latitude !== undefined && dto.longitude !== undefined;
    const digipinFields = shouldRecomputeDigipin
      ? resolveDigipinFields(dto.latitude, dto.longitude, dto.pincode)
      : dto.pincode !== undefined
        ? { digipin: undefined, pincode: dto.pincode.trim() || null }
        : {};

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: dto.name,
        phone: dto.phone,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        km: dto.km,
        ...(digipinFields.digipin !== undefined ? { digipin: digipinFields.digipin } : {}),
        ...(digipinFields.pincode !== undefined ? { pincode: digipinFields.pincode } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        latitude: true,
        longitude: true,
        digipin: true,
        pincode: true,
        km: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Profile updated',
      data: updated,
    };
  }

  @Get('marketplace/products')
  myMarketplaceProducts(@CurrentUser() user: AuthUser) {
    return this.marketplace.listForUser(user.id);
  }

  @Post('marketplace/products')
  async createMarketplaceProduct(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMarketplaceProductDto,
  ) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    });
    return this.marketplace.createForUser(user.id, dbUser?.name, dto);
  }

  @Get('service-providers')
  myServiceProviders(@CurrentUser() user: AuthUser) {
    return this.serviceProviders.listForUser(user.id);
  }

  @Get('service-providers/:id')
  myServiceProvider(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.serviceProviders.findOneForUser(user.id, id);
  }

  @Post('service-providers')
  createMyServiceProvider(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMyServiceProviderDto,
  ) {
    return this.serviceProviders.createForUser(user.id, dto);
  }

  @Patch('service-providers/:id')
  updateMyServiceProvider(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMyServiceProviderDto,
  ) {
    return this.serviceProviders.updateForUser(user.id, id, dto);
  }

  @Delete('service-providers/:id')
  removeMyServiceProvider(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.serviceProviders.removeForUser(user.id, id);
  }

  @Post('service-providers/:id/business-verification')
  submitBusinessVerification(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitBusinessVerificationDto,
  ) {
    return this.serviceProviders.submitBusinessVerificationForUser(user.id, id, dto);
  }

  @Get('broadcasts')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  listBroadcasts(@CurrentUser() user: AuthUser) {
    return this.broadcasts.listForUser(user.id);
  }

  @Patch('broadcasts/:id/read')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  markBroadcastRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.broadcasts.markRead(user.id, id);
  }
}
