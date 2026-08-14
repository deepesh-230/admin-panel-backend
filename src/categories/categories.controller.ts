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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Permissions('categories.read')
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.categoriesService.findAll(search, activeFilter);
  }

  @Get(':categoryId/subcategories')
  @Permissions('categories.read')
  listSubcategories(@Param('categoryId') categoryId: string) {
    return this.categoriesService.listSubcategories(categoryId);
  }

  @Get(':id')
  @Permissions('categories.read')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @Permissions('categories.write')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Permissions('categories.write')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('categories.write')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
