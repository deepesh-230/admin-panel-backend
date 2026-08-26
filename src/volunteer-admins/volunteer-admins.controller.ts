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
import {
  CreateVolunteerAdminDto,
  UpdateVolunteerAdminDto,
} from './dto/volunteer-admin.dto';
import { VolunteerAdminsService } from './volunteer-admins.service';

@Controller('volunteer-admins')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class VolunteerAdminsController {
  constructor(private readonly volunteerAdminsService: VolunteerAdminsService) {}

  @Get()
  @Permissions('users.read')
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.volunteerAdminsService.findAll({ search, isActive: activeFilter });
  }

  @Get(':id')
  @Permissions('users.read')
  findOne(@Param('id') id: string) {
    return this.volunteerAdminsService.findOne(id);
  }

  @Post()
  @Roles(RoleName.ADMIN)
  @Permissions('users.write')
  create(@Body() dto: CreateVolunteerAdminDto) {
    return this.volunteerAdminsService.create(dto);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  @Permissions('users.write')
  update(@Param('id') id: string, @Body() dto: UpdateVolunteerAdminDto) {
    return this.volunteerAdminsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @Permissions('users.write')
  remove(@Param('id') id: string) {
    return this.volunteerAdminsService.remove(id);
  }
}
