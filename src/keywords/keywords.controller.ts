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
import { CreateKeywordDto, UpdateKeywordDto } from './dto/keyword.dto';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get()
  @Permissions('categories.read')
  findAll(@Query('search') search?: string) {
    return this.keywordsService.findAll(search);
  }

  @Get(':id')
  @Permissions('categories.read')
  findOne(@Param('id') id: string) {
    return this.keywordsService.findOne(id);
  }

  @Post()
  @Permissions('categories.write')
  create(@Body() dto: CreateKeywordDto) {
    return this.keywordsService.create(dto);
  }

  @Patch(':id')
  @Permissions('categories.write')
  update(@Param('id') id: string, @Body() dto: UpdateKeywordDto) {
    return this.keywordsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('categories.write')
  remove(@Param('id') id: string) {
    return this.keywordsService.remove(id);
  }
}
