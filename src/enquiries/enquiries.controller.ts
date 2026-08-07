import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { EnquiriesService } from './enquiries.service';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.enquiriesService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Post()
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
    },
  ) {
    return this.enquiriesService.create(body);
  }

  @Patch(':id')
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
  remove(@Param('id') id: string) {
    return this.enquiriesService.remove(id);
  }
}

