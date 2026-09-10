import { Module } from '@nestjs/common';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import {
  BlogsController,
  CmsPagesController,
  FaqsController,
  HelpTicketsController,
  HomeBannersController,
  JobAlertsController,
  MarketplacePartiesController,
  MarketplaceProductsController,
  SuggestionsController,
  UsefulLinksController,
  SocialSettingsController,
  VolunteersController,
} from './cms.controller';
import { CmsService } from './cms.service';
import { BroadcastsService } from './broadcasts.service';

@Module({
  imports: [MarketplaceModule],
  controllers: [
    FaqsController,
    UsefulLinksController,
    SocialSettingsController,
    HelpTicketsController,
    CmsPagesController,
    BlogsController,
    HomeBannersController,
    JobAlertsController,
    SuggestionsController,
    VolunteersController,
    MarketplaceProductsController,
    MarketplacePartiesController,
  ],
  providers: [CmsService, BroadcastsService],
  exports: [CmsService, BroadcastsService],
})
export class CmsModule {}
