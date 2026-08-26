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
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AssignProviderAdminDto,
  CreateServiceProviderDto,
  ListServiceProvidersQueryDto,
  RejectServiceProviderDto,
  UpdateServiceProviderDto,
} from './dto/service-provider.dto';
import { ServiceProvidersService } from './service-providers.service';

@Controller('service-providers')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.SERVICE_PROVIDER_ADMIN)
export class ServiceProvidersController {
  constructor(private readonly serviceProvidersService: ServiceProvidersService) {}

  /** Mobile discovery — approved + active providers only */
  @Public()
  @Get('search')
  searchPublic(@Query() query: ListServiceProvidersQueryDto) {
    return this.serviceProvidersService.searchPublic(query);
  }

  @Public()
  @Get('search/:id')
  findOnePublic(@Param('id') id: string) {
    return this.serviceProvidersService.findOnePublic(id);
  }

  @Get()
  @Permissions('providers.read')
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListServiceProvidersQueryDto) {
    return this.serviceProvidersService.findAll(user, query);
  }

  @Get(':id')
  @Permissions('providers.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.serviceProvidersService.findOne(id, user);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  create(@Body() dto: CreateServiceProviderDto, @CurrentUser() user: AuthUser) {
    return this.serviceProvidersService.create(dto, user);
  }

  @Patch(':id')
  @Permissions('providers.write')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceProviderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceProvidersService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.serviceProvidersService.remove(id, user);
  }

  @Post(':id/approve')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.serviceProvidersService.approve(id, user);
  }

  @Post(':id/reject')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectServiceProviderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceProvidersService.reject(id, dto.reason, user);
  }

  @Get(':id/admins')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.read')
  listAdmins(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.serviceProvidersService.listAdmins(id, user);
  }

  @Post(':id/admins')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  assignAdmin(
    @Param('id') id: string,
    @Body() dto: AssignProviderAdminDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceProvidersService.assignAdmin(id, dto, user);
  }

  @Delete(':id/admins/:userId')
  @Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
  @Permissions('providers.write')
  removeAdmin(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceProvidersService.removeAdmin(id, userId, user);
  }
}
