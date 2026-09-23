import { Injectable, OnModuleInit } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentPlansController } from './payment-plans.controller';
import { PaymentPlansService } from './payment-plans.service';
import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';

@Injectable()
class PaymentPlansBootstrap implements OnModuleInit {
  constructor(private readonly paymentPlans: PaymentPlansService) {}

  async onModuleInit() {
    await this.paymentPlans.ensureDefaults();
  }
}

@Module({
  controllers: [PaymentsController, PaymentPlansController, RazorpayController],
  providers: [PaymentsService, PaymentPlansService, PaymentPlansBootstrap, RazorpayService],
  exports: [PaymentsService, PaymentPlansService, RazorpayService],
})
export class PaymentsModule {}
