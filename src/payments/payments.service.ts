import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentPurpose, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePaymentDto,
  ListPaymentsQueryDto,
  UpdatePaymentDto,
} from './dto/payment.dto';

const paymentInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
} as const;

type PaymentRow = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private sanitize(row: PaymentRow) {
    return {
      id: row.id,
      userId: row.userId,
      payerName: row.payerName,
      payerEmail: row.payerEmail,
      payerPhone: row.payerPhone,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      purpose: row.purpose,
      planId: row.planId,
      gateway: row.gateway,
      orderId: row.orderId,
      paymentId: row.paymentId,
      referenceNo: row.referenceNo,
      notes: row.notes,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
    };
  }

  async findAll(query: ListPaymentsQueryDto) {
    const where: Prisma.PaymentWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.purpose) where.purpose = query.purpose;

    if (query.from || query.to) {
      const paidAt: Prisma.DateTimeFilter = {};
      if (query.from) paidAt.gte = new Date(query.from);
      if (query.to) {
        const end = new Date(query.to);
        end.setHours(23, 59, 59, 999);
        paidAt.lte = end;
      }
      where.paidAt = paidAt;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { payerName: { contains: q, mode: 'insensitive' } },
        { payerEmail: { contains: q, mode: 'insensitive' } },
        { payerPhone: { contains: q, mode: 'insensitive' } },
        { orderId: { contains: q, mode: 'insensitive' } },
        { paymentId: { contains: q, mode: 'insensitive' } },
        { referenceNo: { contains: q, mode: 'insensitive' } },
        { planId: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.payment.findMany({
      where,
      include: paymentInclude,
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map((row) => this.sanitize(row));
  }

  async getSummary() {
    const [successAgg, pending, failed, refunded] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.REFUNDED } }),
    ]);

    return {
      successCount: successAgg._count,
      successAmount: Number(successAgg._sum.amount ?? 0),
      pendingCount: pending,
      failedCount: failed,
      refundedCount: refunded,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.payment.findUnique({
      where: { id },
      include: paymentInclude,
    });
    if (!row) throw new NotFoundException('Payment not found');
    return this.sanitize(row);
  }

  async create(dto: CreatePaymentDto) {
    if (dto.paymentId) {
      const existing = await this.prisma.payment.findUnique({
        where: { paymentId: dto.paymentId },
      });
      if (existing) {
        throw new ConflictException('Payment ID already exists');
      }
    }

    const status = dto.status ?? PaymentStatus.PENDING;
    const paidAt =
      dto.paidAt !== undefined
        ? new Date(dto.paidAt)
        : status === PaymentStatus.SUCCESS
          ? new Date()
          : undefined;
    const purpose = dto.purpose ?? PaymentPurpose.OTHER;
    const validUntil =
      status === PaymentStatus.SUCCESS && purpose === PaymentPurpose.SPONSORSHIP && paidAt
        ? new Date(paidAt.getTime() + 365 * 24 * 60 * 60 * 1000)
        : undefined;

    try {
      const row = await this.prisma.payment.create({
        data: {
          userId: dto.userId,
          payerName: dto.payerName,
          payerEmail: dto.payerEmail,
          payerPhone: dto.payerPhone,
          amount: dto.amount,
          currency: dto.currency ?? 'INR',
          status,
          purpose,
          planId: dto.planId,
          gateway: dto.gateway,
          orderId: dto.orderId,
          paymentId: dto.paymentId,
          referenceNo: dto.referenceNo,
          notes: dto.notes,
          paidAt,
          validUntil,
        },
        include: paymentInclude,
      });
      return this.sanitize(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Payment ID already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);

    if (dto.paymentId) {
      const clash = await this.prisma.payment.findFirst({
        where: { paymentId: dto.paymentId, NOT: { id } },
      });
      if (clash) throw new ConflictException('Payment ID already exists');
    }

    const nextStatus = dto.status;
    let paidAt: Date | null | undefined = undefined;
    let validUntil: Date | null | undefined = undefined;
    const current = await this.prisma.payment.findUnique({ where: { id } });
    if (dto.paidAt !== undefined) {
      paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
    } else if (nextStatus === PaymentStatus.SUCCESS) {
      if (current && !current.paidAt) paidAt = new Date();
    } else if (
      nextStatus === PaymentStatus.PENDING ||
      nextStatus === PaymentStatus.FAILED ||
      nextStatus === PaymentStatus.CANCELLED
    ) {
      paidAt = null;
      validUntil = null;
    }

    const effectivePurpose = dto.purpose ?? current?.purpose;
    const effectivePaidAt = paidAt === undefined ? current?.paidAt : paidAt;
    if (
      (nextStatus === PaymentStatus.SUCCESS || current?.status === PaymentStatus.SUCCESS) &&
      effectivePurpose === PaymentPurpose.SPONSORSHIP &&
      effectivePaidAt &&
      !current?.validUntil
    ) {
      validUntil = new Date(new Date(effectivePaidAt).getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    try {
      const row = await this.prisma.payment.update({
        where: { id },
        data: {
          ...(dto.userId !== undefined && { userId: dto.userId }),
          ...(dto.payerName !== undefined && { payerName: dto.payerName }),
          ...(dto.payerEmail !== undefined && { payerEmail: dto.payerEmail }),
          ...(dto.payerPhone !== undefined && { payerPhone: dto.payerPhone }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.currency !== undefined && { currency: dto.currency }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.purpose !== undefined && { purpose: dto.purpose }),
          ...(dto.planId !== undefined && { planId: dto.planId }),
          ...(dto.gateway !== undefined && { gateway: dto.gateway }),
          ...(dto.orderId !== undefined && { orderId: dto.orderId }),
          ...(dto.paymentId !== undefined && { paymentId: dto.paymentId }),
          ...(dto.referenceNo !== undefined && { referenceNo: dto.referenceNo }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(paidAt !== undefined && { paidAt }),
          ...(validUntil !== undefined && { validUntil }),
        },
        include: paymentInclude,
      });
      return this.sanitize(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Payment ID already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });
    return { id, deleted: true };
  }
}
