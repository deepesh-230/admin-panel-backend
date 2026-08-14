import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './dto/subcategory.dto';
import { SubcategoriesService } from './subcategories.service';

@Controller('subcategories')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get(':subcategoryId/keywords')
  @Permissions('categories.read')
  listKeywords(@Param('subcategoryId') subcategoryId: string) {
    return this.subcategoriesService.listKeywords(subcategoryId);
  }

  @Get(':id')
  @Permissions('categories.read')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Post()
  @Permissions('categories.write')
  create(@Body() dto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(dto);
  }

  @Patch(':id')
  @Permissions('categories.write')
  update(@Param('id') id: string, @Body() dto: UpdateSubcategoryDto) {
    return this.subcategoriesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('categories.write')
  remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(id);
  }
}
