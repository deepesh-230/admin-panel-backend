import { Injectable, OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentPlansController } from './payment-plans.controller';
import { PaymentPlansService } from './payment-plans.service';

@Injectable()
class PaymentPlansBootstrap implements OnModuleInit {
  constructor(private readonly paymentPlans: PaymentPlansService) {}

  async onModuleInit() {
    await this.paymentPlans.ensureDefaults();
  }
}

@Module({
  controllers: [PaymentsController, PaymentPlansController],
  providers: [PaymentsService, PaymentPlansService, PaymentPlansBootstrap],
  exports: [PaymentsService, PaymentPlansService],
})
export class PaymentsModule {}
