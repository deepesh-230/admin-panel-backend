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
import {
  BecomeApplicationStatus,
  BecomeTarget,
  RoleName,
} from '@prisma/client';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { BecomeService } from './become.service';
import {
  CreateBecomeQuestionDto,
  UpdateBecomeApplicationDto,
  UpdateBecomeQuestionDto,
} from './dto/become.dto';

@Controller('become-questions')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class BecomeQuestionsController {
  constructor(private readonly become: BecomeService) {}

  @Get()
  @Permissions('cms.read')
  list(@Query('target') target?: BecomeTarget) {
    const filter =
      target && Object.values(BecomeTarget).includes(target) ? target : undefined;
    return this.become.listQuestionsAdmin(filter);
  }

  @Post()
  @Permissions('cms.write')
  create(@Body() dto: CreateBecomeQuestionDto) {
    return this.become.createQuestion(dto);
  }

  @Patch(':id')
  @Permissions('cms.write')
  update(@Param('id') id: string, @Body() dto: UpdateBecomeQuestionDto) {
    return this.become.updateQuestion(id, dto);
  }

  @Delete(':id')
  @Permissions('cms.write')
  remove(@Param('id') id: string) {
    return this.become.removeQuestion(id);
  }
}

@Controller('become-applications')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class BecomeApplicationsController {
  constructor(private readonly become: BecomeService) {}

  @Get()
  @Permissions('cms.read')
  list(
    @Query('target') target?: BecomeTarget,
    @Query('status') status?: BecomeApplicationStatus,
    @Query('search') search?: string,
  ) {
    const targetFilter =
      target && Object.values(BecomeTarget).includes(target) ? target : undefined;
    const statusFilter =
      status && Object.values(BecomeApplicationStatus).includes(status)
        ? status
        : undefined;
    return this.become.listApplications({
      target: targetFilter,
      status: statusFilter,
      search,
    });
  }

  @Get(':id')
  @Permissions('cms.read')
  findOne(@Param('id') id: string) {
    return this.become.getApplication(id);
  }

  @Patch(':id')
  @Permissions('cms.write')
  update(@Param('id') id: string, @Body() dto: UpdateBecomeApplicationDto) {
    return this.become.updateApplication(id, dto);
  }
}
