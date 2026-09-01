import { Module } from '@nestjs/common';
import { CmsModule } from '../cms/cms.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [PrismaModule, MarketplaceModule, CmsModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
