import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BecomeTarget, CategoryType } from '@prisma/client';
import { CreateBecomeApplicationDto } from '../become/dto/become.dto';
import { Public } from '../common/decorators/public.decorator';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { CreatePublicHelpTicketDto } from './dto/create-public-help-ticket.dto';
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

  @Get('home-banners')
  listHomeBanners(
    @Query('stateId') stateId?: string,
    @Query('city') city?: string,
  ) {
    return this.publicService.listHomeBanners({ stateId, city });
  }

  @Get('job-alerts')
  listJobAlerts() {
    return this.publicService.listJobAlerts();
  }

  @Get('payment-plans')
  listPaymentPlans() {
    return this.publicService.listPaymentPlans();
  }

  @Get('useful-links')
  listUsefulLinks() {
    return this.publicService.listUsefulLinks();
  }

  @Get('social-settings')
  listSocialSettings() {
    return this.publicService.listSocialSettings();
  }

  @Get('become-questions')
  listBecomeQuestions(@Query('target') target?: string) {
    if (!target || !Object.values(BecomeTarget).includes(target as BecomeTarget)) {
      throw new BadRequestException(
        'Query target is required (STATE_ADMIN, VOLUNTEER, or PROVIDER_ADMIN)',
      );
    }
    return this.publicService.listBecomeQuestions(target as BecomeTarget);
  }

  @Get('become-applications/mine')
  listMyBecomeApplications(
    @Query('userId') userId?: string,
    @Query('email') email?: string,
  ) {
    return this.publicService.listMyBecomeApplications({ userId, email });
  }

  @Post('become-applications')
  submitBecomeApplication(@Body() dto: CreateBecomeApplicationDto) {
    return this.publicService.submitBecomeApplication(dto);
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

  @Post('help-tickets')
  createHelpTicket(@Body() dto: CreatePublicHelpTicketDto) {
    return this.publicService.createHelpTicket(dto);
  }
}
