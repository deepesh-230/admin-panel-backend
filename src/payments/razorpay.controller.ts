import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import {
  CreateRazorpayOrderDto,
  MarkRazorpayFailedDto,
  VerifyRazorpayPaymentDto,
} from './dto/razorpay.dto';
import { RazorpayService } from './razorpay.service';

@Controller('public/payments/razorpay')
@Public()
export class RazorpayController {
  constructor(private readonly razorpay: RazorpayService) {}

  /** Create a Razorpay order for a sponsorship plan (amount taken from server plan config). */
  @Post('create-order')
  createOrder(@Body() dto: CreateRazorpayOrderDto) {
    return this.razorpay.createOrder(dto);
  }

  /** Verify checkout signature and mark the Payment SUCCESS. */
  @Post('verify')
  verify(@Body() dto: VerifyRazorpayPaymentDto) {
    return this.razorpay.verifyPayment(dto);
  }

  /** Best-effort mark PENDING order as FAILED when the user cancels / checkout errors. */
  @Post('mark-failed')
  markFailed(@Body() dto: MarkRazorpayFailedDto) {
    return this.razorpay.markFailed(dto.razorpayOrderId, dto.reason);
  }
}
