import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UpdatePermissionsMatrixDto,
  UpdateRolePermissionsDto,
} from './dto/permissions.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@Roles(RoleName.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('matrix')
  @Permissions('settings.write')
  getMatrix() {
    return this.permissionsService.getMatrix();
  }

  @Put('matrix')
  @Permissions('settings.write')
  updateMatrix(@Body() dto: UpdatePermissionsMatrixDto) {
    return this.permissionsService.updateMatrix(dto.roles);
  }

  @Put('roles/:roleName')
  @Permissions('settings.write')
  setRolePermissions(
    @Param('roleName') roleName: RoleName,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.permissionsService.setRolePermissions(roleName, dto.permissionCodes);
  }

  @Post('roles/:roleName/reset')
  @Permissions('settings.write')
  resetRole(@Param('roleName') roleName: RoleName) {
    return this.permissionsService.resetRole(roleName);
  }

  @Post('reset')
  @Permissions('settings.write')
  resetAll() {
    return this.permissionsService.resetAllEditable();
  }
}
