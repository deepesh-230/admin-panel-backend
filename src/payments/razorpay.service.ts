import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentPurpose, PaymentStatus, Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { addPlanDuration, type PaymentPlanDurationUnit } from './payment-plan.defaults';
import {
  CreateRazorpayOrderDto,
  VerifyRazorpayPaymentDto,
} from './dto/razorpay.dto';

function normalizePlanCode(planId: string) {
  const code = planId.trim().toLowerCase();
  return code === 'diamond' ? 'platinum' : code;
}

function rupeesToPaise(amountRupees: number) {
  return Math.round(amountRupees * 100);
}

@Injectable()
export class RazorpayService {
  private client: Razorpay | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private keyId() {
    return (this.config.get<string>('RAZORPAY_KEY_ID') || '').trim();
  }

  private keySecret() {
    return (this.config.get<string>('RAZORPAY_KEY_SECRET') || '').trim();
  }

  private getClient(): Razorpay {
    const key_id = this.keyId();
    const key_secret = this.keySecret();
    if (!key_id || !key_secret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }
    if (!this.client) {
      this.client = new Razorpay({ key_id, key_secret });
    }
    return this.client;
  }

  private async sponsorshipValidUntil(planId: string | null | undefined, paidAt: Date) {
    let value = 1;
    let unit: PaymentPlanDurationUnit = 'YEAR';
    if (planId?.trim()) {
      const code = normalizePlanCode(planId);
      const plan = await this.prisma.paymentPlan.findUnique({ where: { code } });
      if (plan) {
        value = plan.durationValue > 0 ? plan.durationValue : 1;
        unit = plan.durationUnit === 'MONTH' ? 'MONTH' : 'YEAR';
      }
    }
    return addPlanDuration(paidAt, value, unit);
  }

  async createOrder(dto: CreateRazorpayOrderDto) {
    const planCode = normalizePlanCode(dto.planId);
    const plan = await this.prisma.paymentPlan.findFirst({
      where: { code: planCode, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException(`Payment plan "${planCode}" not found or inactive`);
    }

    const amountRupees = Number(plan.amount);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      throw new BadRequestException('Plan amount is invalid');
    }
    const amountPaise = rupeesToPaise(amountRupees);
    const currency = (plan.currency || 'INR').toUpperCase();

    let userId: string | undefined;
    if (dto.userId?.trim()) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId.trim() },
        select: { id: true },
      });
      if (user) userId = user.id;
    }

    const razorpay = this.getClient();
    const receipt = `sp_${planCode}_${Date.now()}`.slice(0, 40);

    let order: { id: string; amount: number | string; currency: string };
    try {
      order = (await razorpay.orders.create({
        amount: amountPaise,
        currency,
        receipt,
        notes: {
          planId: planCode,
          purpose: PaymentPurpose.SPONSORSHIP,
          ...(userId ? { userId } : {}),
        },
      })) as { id: string; amount: number | string; currency: string };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create Razorpay order';
      throw new BadRequestException(message);
    }

    const payerNote = dto.payerNote?.trim() || undefined;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        payerName: dto.payerName?.trim() || undefined,
        payerEmail: dto.payerEmail?.trim() || undefined,
        payerPhone: dto.payerPhone?.trim() || undefined,
        amount: new Prisma.Decimal(amountRupees),
        currency,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.SPONSORSHIP,
        planId: planCode,
        gateway: 'razorpay',
        orderId: order.id,
        notes: `Razorpay order ${order.id}`,
        payerNote,
      },
    });

    return {
      keyId: this.keyId(),
      orderId: order.id,
      amountPaise,
      amountRupees,
      currency,
      planId: planCode,
      paymentRecordId: payment.id,
    };
  }

  async verifyPayment(dto: VerifyRazorpayPaymentDto) {
    const secret = this.keySecret();
    if (!secret) {
      throw new ServiceUnavailableException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }

    const body = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { orderId: dto.razorpayOrderId, gateway: 'razorpay' },
    });
    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        id: payment.id,
        status: payment.status,
        planId: payment.planId,
        amount: Number(payment.amount),
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        paidAt: payment.paidAt,
        validUntil: payment.validUntil,
      };
    }

    const paidAt = new Date();
    const validUntil =
      payment.purpose === PaymentPurpose.SPONSORSHIP
        ? await this.sponsorshipValidUntil(payment.planId, paidAt)
        : null;

    let updated;
    try {
      updated = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          paymentId: dto.razorpayPaymentId,
          paidAt,
          validUntil: validUntil ?? undefined,
          notes: payment.notes
            ? `${payment.notes}; verified ${dto.razorpayPaymentId}`
            : `Verified ${dto.razorpayPaymentId}`,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Same Razorpay paymentId already recorded (retry) — return existing success row
        const existing = await this.prisma.payment.findUnique({
          where: { paymentId: dto.razorpayPaymentId },
        });
        if (existing) {
          return {
            id: existing.id,
            status: existing.status,
            planId: existing.planId,
            amount: Number(existing.amount),
            orderId: existing.orderId,
            paymentId: existing.paymentId,
            paidAt: existing.paidAt,
            validUntil: existing.validUntil,
          };
        }
      }
      throw error;
    }

    return {
      id: updated.id,
      status: updated.status,
      planId: updated.planId,
      amount: Number(updated.amount),
      orderId: updated.orderId,
      paymentId: updated.paymentId,
      paidAt: updated.paidAt,
      validUntil: updated.validUntil,
    };
  }

  async markFailed(orderId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, gateway: 'razorpay', status: PaymentStatus.PENDING },
    });
    if (!payment) return { updated: false };

    const cancelled = /cancel/i.test(reason || '');
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: cancelled ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
        notes: reason
          ? `${payment.notes || ''}; ${cancelled ? 'cancelled' : 'failed'}: ${reason}`.trim()
          : payment.notes,
      },
    });
    return { updated: true };
  }
}
