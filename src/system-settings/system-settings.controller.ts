import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { SystemSettingsService } from './system-settings.service';

@Controller('system-settings')
@Roles(RoleName.ADMIN)
export class SystemSettingsController {
  constructor(private readonly systemSettings: SystemSettingsService) {}

  @Get()
  @Permissions('settings.write')
  list() {
    return this.systemSettings.list();
  }

  @Put()
  @Permissions('settings.write')
  update(@Body() dto: UpdateSystemSettingsDto) {
    return this.systemSettings.updateMany(dto.settings);
  }

  /** Manual trigger for Central Admin (also runs on a schedule). */
  @Post('run-job-alert-lifecycle')
  @Permissions('settings.write')
  runLifecycle() {
    return this.systemSettings.runJobAlertLifecycle();
  }
}
