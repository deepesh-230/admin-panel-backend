import { Module } from '@nestjs/common';
import { PushModule } from '../push/push.module';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [PushModule],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
