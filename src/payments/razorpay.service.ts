import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  ProviderApprovalStatus,
  ProviderSponsorshipStatus,
} from '@prisma/client';
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

const TIER_RANK: Record<string, number> = {
  silver: 1,
  gold: 2,
  platinum: 3,
};

function parseProviderIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === 'string' && id.length > 0);
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

  /** Ensure user owns/admins each provider and they are approved + active. */
  private async assertSponsorableProviders(userId: string, providerIds: string[]) {
    const uniqueIds = [...new Set(providerIds.map((id) => id.trim()).filter(Boolean))];
    if (!uniqueIds.length) {
      throw new BadRequestException('Select at least one business to sponsor');
    }

    const rows = await this.prisma.serviceProvider.findMany({
      where: {
        id: { in: uniqueIds },
        OR: [{ createdById: userId }, { admins: { some: { userId } } }],
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        approvalStatus: true,
      },
    });

    if (rows.length !== uniqueIds.length) {
      throw new BadRequestException(
        'One or more selected businesses were not found or are not yours',
      );
    }

    const ineligible = rows.filter(
      (r) => !r.isActive || r.approvalStatus !== ProviderApprovalStatus.APPROVED,
    );
    if (ineligible.length) {
      throw new BadRequestException(
        `Only approved active businesses can be sponsored: ${ineligible.map((r) => r.name).join(', ')}`,
      );
    }

    return uniqueIds;
  }

  /** Refresh denormalized sponsor fields from active sponsorships (highest tier). */
  async refreshProviderSponsorFields(serviceProviderId: string) {
    const now = new Date();
    const active = await this.prisma.providerSponsorship.findMany({
      where: {
        serviceProviderId,
        status: ProviderSponsorshipStatus.ACTIVE,
        validUntil: { gte: now },
      },
      select: { planId: true, validUntil: true },
    });

    if (!active.length) {
      await this.prisma.serviceProvider.update({
        where: { id: serviceProviderId },
        data: { sponsorPlanId: null, sponsoredUntil: null },
      });
      return;
    }

    let best = active[0];
    for (const row of active.slice(1)) {
      const br = TIER_RANK[normalizePlanCode(best.planId)] ?? 0;
      const rr = TIER_RANK[normalizePlanCode(row.planId)] ?? 0;
      if (rr > br || (rr === br && row.validUntil > best.validUntil)) {
        best = row;
      }
    }

    await this.prisma.serviceProvider.update({
      where: { id: serviceProviderId },
      data: {
        sponsorPlanId: normalizePlanCode(best.planId),
        sponsoredUntil: best.validUntil,
      },
    });
  }

  private async activateProviderSponsorships(
    paymentId: string,
    planId: string,
    providerIds: string[],
    validUntil: Date,
    paidAt: Date,
  ) {
    for (const serviceProviderId of providerIds) {
      await this.prisma.providerSponsorship.create({
        data: {
          serviceProviderId,
          paymentId,
          planId,
          startsAt: paidAt,
          validUntil,
          status: ProviderSponsorshipStatus.ACTIVE,
        },
      });
      await this.refreshProviderSponsorFields(serviceProviderId);
    }
  }

  async createOrder(dto: CreateRazorpayOrderDto) {
    const planCode = normalizePlanCode(dto.planId);
    const plan = await this.prisma.paymentPlan.findFirst({
      where: { code: planCode, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException(`Payment plan "${planCode}" not found or inactive`);
    }

    const unitAmount = Number(plan.amount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new BadRequestException('Plan amount is invalid');
    }

    let userId: string | undefined;
    if (dto.userId?.trim()) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId.trim() },
        select: { id: true },
      });
      if (user) userId = user.id;
    }
    if (!userId) {
      throw new BadRequestException('userId is required to sponsor businesses');
    }

    const serviceProviderIds = await this.assertSponsorableProviders(
      userId,
      dto.serviceProviderIds || [],
    );

    const amountRupees = unitAmount * serviceProviderIds.length;
    const amountPaise = rupeesToPaise(amountRupees);
    const currency = (plan.currency || 'INR').toUpperCase();

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
          userId,
          providerCount: String(serviceProviderIds.length),
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
        notes: `Razorpay order ${order.id}; ${serviceProviderIds.length} business(es)`,
        payerNote,
        serviceProviderIds,
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
      serviceProviderIds,
      unitAmountRupees: unitAmount,
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
        serviceProviderIds: parseProviderIds(payment.serviceProviderIds),
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
            serviceProviderIds: parseProviderIds(existing.serviceProviderIds),
          };
        }
      }
      throw error;
    }

    if (
      payment.purpose === PaymentPurpose.SPONSORSHIP &&
      payment.planId &&
      validUntil
    ) {
      const providerIds = parseProviderIds(payment.serviceProviderIds);
      if (providerIds.length) {
        const existingLinks = await this.prisma.providerSponsorship.count({
          where: { paymentId: payment.id },
        });
        if (!existingLinks) {
          await this.activateProviderSponsorships(
            payment.id,
            normalizePlanCode(payment.planId),
            providerIds,
            validUntil,
            paidAt,
          );
        }
      }
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
      serviceProviderIds: parseProviderIds(updated.serviceProviderIds),
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
