import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ListingsService } from './listings.service';

@Controller('listings')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @Permissions('listings.read')
  findAll(@Query('search') search?: string) {
    return this.listingsService.findAll(search);
  }

  @Get(':id')
  @Permissions('listings.read')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
  @Permissions('listings.write')
  create(
    @Body()
    body: {
      category: string;
      subCategory: string;
      product: string;
      email: string;
      image: string;
      createdBy: string;
      date: string;
      status?: boolean;
    },
  ) {
    return this.listingsService.create(body);
  }

  @Patch(':id')
  @Permissions('listings.write')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      category?: string;
      subCategory?: string;
      product?: string;
      email?: string;
      image?: string;
      createdBy?: string;
      date?: string;
      status?: boolean;
    },
  ) {
    return this.listingsService.update(id, body);
  }

  @Patch(':id/status')
  @Permissions('listings.write')
  updateStatus(@Param('id') id: string, @Body('status') status: boolean) {
    return this.listingsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Permissions('listings.write')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }
}
