import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BroadcastsService } from '../cms/broadcasts.service';
import { CreateMarketplaceProductDto } from './dto/create-marketplace-product.dto';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('profile')
@Roles(RoleName.END_USER, RoleName.ADMIN)
export class ProfileController {
  constructor(
    private readonly marketplace: MarketplaceService,
    private readonly prisma: PrismaService,
    private readonly broadcasts: BroadcastsService,
  ) {}

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

  @Get('broadcasts')
  @Roles(RoleName.END_USER)
  listBroadcasts(@CurrentUser() user: AuthUser) {
    return this.broadcasts.listForUser(user.id);
  }

  @Patch('broadcasts/:id/read')
  @Roles(RoleName.END_USER)
  markBroadcastRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.broadcasts.markRead(user.id, id);
  }
}
