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
    // Same gate as Prisma DDL ensure — skip on prod cold starts once migrations/seed are source of truth.
    if (process.env.RUN_ENSURE_DDL === 'false') return;
    await this.paymentPlans.ensureDefaults();
  }
}

@Module({
  controllers: [PaymentsController, PaymentPlansController, RazorpayController],
  providers: [PaymentsService, PaymentPlansService, PaymentPlansBootstrap, RazorpayService],
  exports: [PaymentsService, PaymentPlansService, RazorpayService],
})
export class PaymentsModule {}
