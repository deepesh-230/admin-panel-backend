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
import { CreateStateAdminDto, UpdateStateAdminDto } from './dto/state-admin.dto';
import { StateAdminsService } from './state-admins.service';

@Controller('state-admins')
@Roles(RoleName.ADMIN)
export class StateAdminsController {
  constructor(private readonly stateAdminsService: StateAdminsService) {}

  @Get()
  @Permissions('state_admins.read')
  findAll(
    @Query('search') search?: string,
    @Query('stateId') stateId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.stateAdminsService.findAll({
      search,
      stateId,
      isActive: activeFilter,
    });
  }

  @Get(':id')
  @Permissions('state_admins.read')
  findOne(@Param('id') id: string) {
    return this.stateAdminsService.findOne(id);
  }

  @Post()
  @Permissions('state_admins.write')
  create(@Body() dto: CreateStateAdminDto) {
    return this.stateAdminsService.create(dto);
  }

  @Patch(':id')
  @Permissions('state_admins.write')
  update(@Param('id') id: string, @Body() dto: UpdateStateAdminDto) {
    return this.stateAdminsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('state_admins.write')
  remove(@Param('id') id: string) {
    return this.stateAdminsService.remove(id);
  }
}
