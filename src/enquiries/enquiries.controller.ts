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
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreateEnquiryDto,
  ListEnquiriesQueryDto,
  UpdateEnquiryDto,
} from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';

@Controller('enquiries')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN, RoleName.VOLUNTEER)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  @Permissions('enquiries.read')
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListEnquiriesQueryDto) {
    return this.enquiriesService.findAll(user, query.search, query.kind, query.status);
  }

  @Get(':id')
  @Permissions('enquiries.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.enquiriesService.findOne(id, user);
  }

  @Post()
  @Permissions('enquiries.write')
  create(@CurrentUser() user: AuthUser, @Body() body: CreateEnquiryDto) {
    return this.enquiriesService.create(user, body);
  }

  @Patch(':id')
  @Permissions('enquiries.write')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateEnquiryDto,
  ) {
    return this.enquiriesService.update(id, user, body);
  }

  @Delete(':id')
  @Permissions('enquiries.write')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.enquiriesService.remove(id, user);
  }
}
