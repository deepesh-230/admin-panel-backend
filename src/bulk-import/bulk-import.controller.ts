import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BulkImportService } from './bulk-import.service';
import type { BulkImportEntity } from './bulk-import.types';
import { BULK_IMPORT_ENTITIES } from './bulk-import.types';
import { BulkImportDto } from './dto/bulk-import.dto';

@Controller('bulk-import')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN, RoleName.VOLUNTEER)
export class BulkImportController {
  constructor(private readonly bulkImportService: BulkImportService) {}

  @Get(':entity/template')
  getTemplate(@Param('entity') entity: BulkImportEntity) {
    if (!BULK_IMPORT_ENTITIES.includes(entity)) {
      return { columns: [], sample: [] };
    }
    return this.bulkImportService.getTemplate(entity);
  }

  @Post()
  import(@Body() dto: BulkImportDto, @CurrentUser() user: AuthUser) {
    return this.bulkImportService.import(
      dto.entity,
      dto.rows,
      dto.dryRun ?? false,
      user,
      { categoryId: dto.categoryId, subcategoryId: dto.subcategoryId },
    );
  }
}
