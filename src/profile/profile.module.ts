import { Module } from '@nestjs/common';
import { CmsModule } from '../cms/cms.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { PaymentsModule } from '../payments/payments.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceProvidersModule } from '../service-providers/service-providers.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [PrismaModule, MarketplaceModule, CmsModule, ServiceProvidersModule, PaymentsModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
