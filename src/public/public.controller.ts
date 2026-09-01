import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { PublicService } from './public.service';

@Controller('public')
@Public()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('categories')
  listCategories(@Query('type') type?: CategoryType) {
    const typeFilter =
      type === CategoryType.CARE || type === CategoryType.SERVICE ? type : undefined;
    return this.publicService.listCategories(typeFilter);
  }

  @Get('categories/:categoryId/subcategories')
  listSubcategories(@Param('categoryId') categoryId: string) {
    return this.publicService.listSubcategories(categoryId);
  }

  @Get('states')
  listStates() {
    return this.publicService.listStates();
  }

  @Get('faqs')
  listFaqs() {
    return this.publicService.listFaqs();
  }

  @Get('blogs')
  listBlogs() {
    return this.publicService.listBlogs();
  }

  @Get('job-alerts')
  listJobAlerts() {
    return this.publicService.listJobAlerts();
  }

  @Get('useful-links')
  listUsefulLinks() {
    return this.publicService.listUsefulLinks();
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.publicService.getPageBySlug(slug);
  }

  @Get('contact')
  getContact() {
    return this.publicService.getContact();
  }

  @Get('marketplace/products')
  listMarketplaceProducts(@Query('search') search?: string) {
    return this.publicService.listMarketplaceProducts(search);
  }

  @Get('marketplace/products/:id')
  getMarketplaceProduct(@Param('id') id: string) {
    return this.publicService.getMarketplaceProduct(id);
  }

  @Post('enquiries')
  createEnquiry(@Body() dto: CreatePublicEnquiryDto) {
    return this.publicService.createEnquiry(dto);
  }
}
