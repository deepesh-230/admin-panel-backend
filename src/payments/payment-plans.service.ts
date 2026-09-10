import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentPlanDurationUnit, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_PAYMENT_PLANS } from './payment-plan.defaults';
import { CreatePaymentPlanDto, UpdatePaymentPlanDto } from './dto/payment-plan.dto';

@Injectable()
export class PaymentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults() {
    // Legacy code rename first so custom diamond amounts are preserved
    const diamond = await this.prisma.paymentPlan.findUnique({ where: { code: 'diamond' } });
    const platinum = await this.prisma.paymentPlan.findUnique({ where: { code: 'platinum' } });
    if (diamond && !platinum) {
      await this.prisma.paymentPlan.update({
        where: { id: diamond.id },
        data: {
          code: 'platinum',
          name: 'Platinum',
          description: diamond.description || 'Top support with a Platinum star.',
        },
      });
    } else if (diamond && platinum) {
      await this.prisma.paymentPlan.delete({ where: { id: diamond.id } });
    }

    for (const plan of DEFAULT_PAYMENT_PLANS) {
      await this.prisma.paymentPlan.upsert({
        where: { code: plan.code },
        // Do not overwrite admin-edited name/amount/description on boot
        update: {},
        create: {
          code: plan.code,
          name: plan.name,
          amount: new Prisma.Decimal(plan.amount),
          description: plan.description,
          durationValue: plan.durationValue,
          durationUnit: plan.durationUnit,
          sortOrder: plan.sortOrder,
          isActive: true,
        },
      });
    }
  }

  private serialize(row: {
    id: string;
    code: string;
    name: string;
    amount: Prisma.Decimal;
    currency: string;
    description: string | null;
    durationValue: number;
    durationUnit: PaymentPlanDurationUnit;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...row,
      amount: Number(row.amount),
    };
  }

  async listAdmin() {
    const rows = await this.prisma.paymentPlan.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.serialize(r));
  }

  async listPublic() {
    const rows = await this.prisma.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.serialize(r));
  }

  async findOne(id: string) {
    const row = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Payment plan not found');
    return this.serialize(row);
  }

  async create(dto: CreatePaymentPlanDto) {
    const code = dto.code.trim().toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(code)) {
      throw new BadRequestException('Plan code must be lowercase letters, numbers, _ or -');
    }
    try {
      const row = await this.prisma.paymentPlan.create({
        data: {
          code,
          name: dto.name.trim(),
          amount: new Prisma.Decimal(dto.amount),
          currency: dto.currency?.trim() || 'INR',
          description: dto.description?.trim() || null,
          durationValue: dto.durationValue ?? 1,
          durationUnit: dto.durationUnit ?? PaymentPlanDurationUnit.YEAR,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });
      return this.serialize(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('A plan with this code already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePaymentPlanDto) {
    await this.findOne(id);
    try {
      const row = await this.prisma.paymentPlan.update({
        where: { id },
        data: {
          ...(dto.code !== undefined && { code: dto.code.trim().toLowerCase() }),
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(dto.amount !== undefined && { amount: new Prisma.Decimal(dto.amount) }),
          ...(dto.currency !== undefined && { currency: dto.currency.trim() || 'INR' }),
          ...(dto.description !== undefined && {
            description: dto.description?.trim() || null,
          }),
          ...(dto.durationValue !== undefined && { durationValue: dto.durationValue }),
          ...(dto.durationUnit !== undefined && { durationUnit: dto.durationUnit }),
          ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
      return this.serialize(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('A plan with this code already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.paymentPlan.delete({ where: { id } });
    return { id, deleted: true };
  }
}
