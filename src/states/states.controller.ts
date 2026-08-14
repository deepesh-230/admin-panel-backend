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
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { StatesService } from './states.service';

@Controller('states')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  @Permissions('states.read')
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.statesService.findAll(search, activeFilter);
  }

  @Get(':id')
  @Permissions('states.read')
  findOne(@Param('id') id: string) {
    return this.statesService.findOne(id);
  }

  @Post()
  @Roles(RoleName.ADMIN)
  @Permissions('states.write')
  create(@Body() dto: CreateStateDto) {
    return this.statesService.create(dto);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  @Permissions('states.write')
  update(@Param('id') id: string, @Body() dto: UpdateStateDto) {
    return this.statesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @Permissions('states.write')
  remove(@Param('id') id: string) {
    return this.statesService.remove(id);
  }
}
