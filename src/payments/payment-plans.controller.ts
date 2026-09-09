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
import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';
import { PaymentPlansService } from './payment-plans.service';

@Controller('payment-plans')
@Roles(RoleName.ADMIN, RoleName.STATE_ADMIN)
export class PaymentPlansController {
  constructor(private readonly paymentPlans: PaymentPlansService) {}

  @Get()
  @Permissions('payments.read')
  list() {
    return this.paymentPlans.listAdmin();
  }

  @Get(':id')
  @Permissions('payments.read')
  findOne(@Param('id') id: string) {
    return this.paymentPlans.findOne(id);
  }

  @Post()
  @Permissions('payments.write')
  create(@Body() dto: CreatePaymentPlanDto) {
    return this.paymentPlans.create(dto);
  }

  @Patch(':id')
  @Permissions('payments.write')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentPlanDto) {
    return this.paymentPlans.update(id, dto);
  }

  @Delete(':id')
  @Permissions('payments.write')
  remove(@Param('id') id: string) {
    return this.paymentPlans.remove(id);
  }
}
