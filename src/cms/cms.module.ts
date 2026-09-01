import { Module } from '@nestjs/common';
import {
  BlogsController,
  CmsPagesController,
  FaqsController,
  HelpTicketsController,
  JobAlertsController,
  MarketplacePartiesController,
  MarketplaceProductsController,
  SuggestionsController,
  UsefulLinksController,
  VolunteersController,
} from './cms.controller';
import { CmsService } from './cms.service';
import { BroadcastsService } from './broadcasts.service';

@Module({
  controllers: [
    FaqsController,
    UsefulLinksController,
    HelpTicketsController,
    CmsPagesController,
    BlogsController,
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
