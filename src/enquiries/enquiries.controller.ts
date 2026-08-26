import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { EnquiriesService } from './enquiries.service';

@Controller('enquiries')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN, RoleName.VOLUNTEER)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  @Permissions('enquiries.read')
  findAll(@Query('search') search?: string, @Query('kind') kind?: string) {
    return this.enquiriesService.findAll(search, kind);
  }

  @Get(':id')
  @Permissions('enquiries.read')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Post()
  @Permissions('enquiries.write')
  create(
    @Body()
    body: {
      category: string;
      subCategory: string;
      product: string;
      name?: string;
      email: string;
      date: string;
      createdBy: string;
      kind?: string;
    },
  ) {
    return this.enquiriesService.create(body);
  }

  @Patch(':id')
  @Permissions('enquiries.write')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      category?: string;
      subCategory?: string;
      product?: string;
      name?: string;
      email?: string;
      date?: string;
      createdBy?: string;
    },
  ) {
    return this.enquiriesService.update(id, body);
  }

  @Delete(':id')
  @Permissions('enquiries.write')
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}
