import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BroadcastsService } from '../cms/broadcasts.service';
import { CreateMarketplaceProductDto, UpdateMarketplaceProductDto } from './dto/create-marketplace-product.dto';
import { RegisterDeviceTokenDto } from './dto/device-token.dto';
import {
  CreateMyServiceProviderDto,
  UpdateMyServiceProviderDto,
} from './dto/my-service-provider.dto';
import { SubmitBusinessVerificationDto } from './dto/submit-business-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { PaymentsService } from '../payments/payments.service';
import { PushService } from '../push/push.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertSubcategoryIds,
  resolvePlaceProfileFields,
  syncUserDisabilities,
} from '../common/utils/user-profile';

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
    private readonly payments: PaymentsService,
    private readonly prisma: PrismaService,
    private readonly broadcasts: BroadcastsService,
    private readonly push: PushService,
  ) {}

  @Get('sponsorship')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN, RoleName.ADMIN)
  getSponsorship(@CurrentUser() user: AuthUser) {
    return this.payments.getActiveSponsorshipForUser(user.id);
  }

  @Patch()
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  async updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    const place = await resolvePlaceProfileFields(this.prisma, {
      location: dto.location,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      pincode: dto.pincode,
      stateId: dto.stateId,
      stateName: dto.stateName,
    });
    const disabilityIds =
      dto.disabilitySubcategoryIds !== undefined
        ? await assertSubcategoryIds(this.prisma, dto.disabilitySubcategoryIds)
        : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.user.update({
        where: { id: user.id },
        data: {
          name: dto.name,
          phone: dto.phone,
          km: dto.km,
          ageRange: dto.ageRange === undefined ? undefined : dto.ageRange,
          ...place,
        },
        include: {
          state: { select: { id: true, name: true, code: true } },
          disabilities: {
            include: {
              subcategory: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      });

      if (place.stateId) {
        await tx.userState.upsert({
          where: {
            userId_stateId: { userId: user.id, stateId: place.stateId },
          },
          update: { isPrimary: true },
          create: { userId: user.id, stateId: place.stateId, isPrimary: true },
        });
      }

      if (disabilityIds !== undefined) {
        await syncUserDisabilities(tx, user.id, disabilityIds);
        return tx.user.findUniqueOrThrow({
          where: { id: user.id },
          include: {
            state: { select: { id: true, name: true, code: true } },
            disabilities: {
              include: {
                subcategory: {
                  select: {
                    id: true,
                    name: true,
                    categoryId: true,
                    category: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        });
      }

      return row;
    });

    const disabilities = updated.disabilities.map((d) => ({
      id: d.subcategory.id,
      name: d.subcategory.name,
      categoryId: d.subcategory.categoryId,
      categoryName: d.subcategory.category.name,
    }));

    return {
      success: true,
      message: 'Profile updated',
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        location: updated.location,
        city: updated.city,
        latitude: updated.latitude,
        longitude: updated.longitude,
        digipin: updated.digipin,
        pincode: updated.pincode,
        km: updated.km,
        ageRange: updated.ageRange,
        isActive: updated.isActive,
        stateId: updated.stateId,
        state: updated.state,
        disabilities,
        disabilitySubcategoryIds: disabilities.map((d) => d.id),
      },
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

  @Patch('marketplace/products/:id')
  updateMarketplaceProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMarketplaceProductDto,
  ) {
    return this.marketplace.updateForUser(user.id, id, dto);
  }

  @Post('marketplace/products/:id/mark-sold')
  markMarketplaceProductSold(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.marketplace.markSoldForUser(user.id, id);
  }

  @Delete('marketplace/products/:id')
  removeMarketplaceProduct(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.marketplace.removeForUser(user.id, id, user.role);
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

  @Post('device-tokens')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  registerDeviceToken(
    @CurrentUser() user: AuthUser,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.push.registerToken(user.id, dto.token, dto.platform);
  }

  @Delete('device-tokens')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  removeDeviceToken(
    @CurrentUser() user: AuthUser,
    @Query('token') token?: string,
  ) {
    return this.push.removeToken(user.id, token);
  }

  @Post('firebase-token')
  @Roles(RoleName.END_USER, RoleName.VOLUNTEER, RoleName.SERVICE_PROVIDER_ADMIN)
  createFirebaseToken(@CurrentUser() user: AuthUser) {
    return this.push.createCustomToken(user.id);
  }
}
