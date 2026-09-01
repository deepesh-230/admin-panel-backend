import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CmsModel, CmsService } from './cms.service';
import { BroadcastsService } from './broadcasts.service';

function resourceController(
  path: string,
  model: CmsModel,
  permission: 'cms' | 'volunteers' | 'marketplace',
  searchFields: string[],
  extraWhere?: (query: Record<string, string | undefined>) => Record<string, unknown>,
  roles: RoleName[] = [RoleName.ADMIN, RoleName.STATE_ADMIN],
) {
  @Controller(path)
  @Roles(...roles)
  class ResourceController {
    constructor(public readonly cms: CmsService) {}

    @Get()
    @Permissions(`${permission}.read`)
    findAll(
      @Query('search') search?: string,
      @Query('kind') kind?: string,
    ) {
      const where = extraWhere?.({ kind }) ?? {};
      return this.cms.findAll(model, search, searchFields, where);
    }

    @Get(':id')
    @Permissions(`${permission}.read`)
    findOne(@Param('id') id: string) {
      return this.cms.findOne(model, id);
    }

    @Post()
    @Permissions(`${permission}.write`)
    create(@Body() body: Record<string, unknown>) {
      const where = extraWhere?.({}) ?? {};
      return this.cms.create(model, { ...where, ...body });
    }

    @Patch(':id')
    @Permissions(`${permission}.write`)
    update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
      return this.cms.update(model, id, body);
    }

    @Delete(':id')
    @Permissions(`${permission}.write`)
    remove(@Param('id') id: string) {
      return this.cms.remove(model, id);
    }
  }

  return ResourceController;
}

export class FaqsController extends resourceController('faqs', 'faq', 'cms', [
  'title',
  'description',
]) {}

@Controller('useful-links')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class UsefulLinksController {
  constructor(
    private readonly cms: CmsService,
    private readonly broadcasts: BroadcastsService,
  ) {}

  @Get()
  @Permissions('cms.read')
  findAll(@Query('search') search?: string) {
    return this.cms.findAll('usefulLink', search, ['title', 'url']);
  }

  @Get(':id')
  @Permissions('cms.read')
  findOne(@Param('id') id: string) {
    return this.cms.findOne('usefulLink', id);
  }

  @Post()
  @Permissions('cms.write')
  create(@Body() body: Record<string, unknown>) {
    return this.cms.create('usefulLink', body);
  }

  @Patch(':id/broadcast')
  @Permissions('cms.write')
  broadcast(@Param('id') id: string) {
    return this.broadcasts.broadcastUsefulLink(id);
  }

  @Patch(':id')
  @Permissions('cms.write')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.cms.update('usefulLink', id, body);
  }

  @Delete(':id')
  @Permissions('cms.write')
  remove(@Param('id') id: string) {
    return this.cms.remove('usefulLink', id);
  }
}

export class HelpTicketsController extends resourceController(
  'help-tickets',
  'helpTicket',
  'cms',
  ['name', 'email', 'message'],
) {}

export class CmsPagesController extends resourceController('pages', 'cmsPage', 'cms', [
  'title',
  'slug',
  'content',
]) {}

export class BlogsController extends resourceController('blogs', 'blog', 'cms', [
  'title',
  'shortDescription',
  'description',
]) {}

@Controller('job-alerts')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class JobAlertsController {
  constructor(
    private readonly cms: CmsService,
    private readonly broadcasts: BroadcastsService,
  ) {}

  @Get()
  @Permissions('cms.read')
  findAll(@Query('search') search?: string) {
    return this.cms.findAll('jobAlert', search, ['title', 'description']);
  }

  @Get(':id')
  @Permissions('cms.read')
  findOne(@Param('id') id: string) {
    return this.cms.findOne('jobAlert', id);
  }

  @Post()
  @Permissions('cms.write')
  create(@Body() body: Record<string, unknown>) {
    return this.cms.create('jobAlert', body);
  }

  @Patch(':id/broadcast')
  @Permissions('cms.write')
  broadcast(@Param('id') id: string) {
    return this.broadcasts.broadcastJobAlert(id);
  }

  @Patch(':id')
  @Permissions('cms.write')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.cms.update('jobAlert', id, body);
  }

  @Delete(':id')
  @Permissions('cms.write')
  remove(@Param('id') id: string) {
    return this.cms.remove('jobAlert', id);
  }
}

export class SuggestionsController extends resourceController(
  'suggestions',
  'suggestion',
  'cms',
  ['title', 'description'],
) {}

export class VolunteersController extends resourceController(
  'volunteers',
  'volunteer',
  'volunteers',
  ['name', 'email', 'phone', 'location'],
  undefined,
  [RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.VOLUNTEER],
) {}

export class MarketplaceProductsController extends resourceController(
  'marketplace/products',
  'marketplaceProduct',
  'marketplace',
  ['name', 'sellerName', 'phone'],
) {}

export class MarketplacePartiesController extends resourceController(
  'marketplace/parties',
  'marketplaceParty',
  'marketplace',
  ['name', 'email', 'phone'],
  (query) => (query.kind ? { kind: query.kind } : {}),
) {}
