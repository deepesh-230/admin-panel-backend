import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.listingsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Post()
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
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ) {
    return this.listingsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }
}

