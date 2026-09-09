import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { CmsModule } from '../cms/cms.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { PaymentsModule } from '../payments/payments.module';
import { BecomeModule } from '../become/become.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StatesModule } from '../states/states.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    StatesModule,
    CmsModule,
    MarketplaceModule,
    SystemSettingsModule,
    PaymentsModule,
    BecomeModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
