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
  providers: [CmsService],
})
export class CmsModule {}
