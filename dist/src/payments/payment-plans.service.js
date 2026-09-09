"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPlansService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const payment_plan_defaults_1 = require("./payment-plan.defaults");
let PaymentPlansService = class PaymentPlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureDefaults() {
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
        }
        else if (diamond && platinum) {
            await this.prisma.paymentPlan.delete({ where: { id: diamond.id } });
        }
        for (const plan of payment_plan_defaults_1.DEFAULT_PAYMENT_PLANS) {
            await this.prisma.paymentPlan.upsert({
                where: { code: plan.code },
                update: {},
                create: {
                    code: plan.code,
                    name: plan.name,
                    amount: new client_1.Prisma.Decimal(plan.amount),
                    description: plan.description,
                    sortOrder: plan.sortOrder,
                    isActive: true,
                },
            });
        }
    }
    serialize(row) {
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
    async findOne(id) {
        const row = await this.prisma.paymentPlan.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Payment plan not found');
        return this.serialize(row);
    }
    async create(dto) {
        const code = dto.code.trim().toLowerCase();
        if (!/^[a-z0-9_-]+$/.test(code)) {
            throw new common_1.BadRequestException('Plan code must be lowercase letters, numbers, _ or -');
        }
        try {
            const row = await this.prisma.paymentPlan.create({
                data: {
                    code,
                    name: dto.name.trim(),
                    amount: new client_1.Prisma.Decimal(dto.amount),
                    currency: dto.currency?.trim() || 'INR',
                    description: dto.description?.trim() || null,
                    sortOrder: dto.sortOrder ?? 0,
                    isActive: dto.isActive ?? true,
                },
            });
            return this.serialize(row);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.BadRequestException('A plan with this code already exists');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            const row = await this.prisma.paymentPlan.update({
                where: { id },
                data: {
                    ...(dto.code !== undefined && { code: dto.code.trim().toLowerCase() }),
                    ...(dto.name !== undefined && { name: dto.name.trim() }),
                    ...(dto.amount !== undefined && { amount: new client_1.Prisma.Decimal(dto.amount) }),
                    ...(dto.currency !== undefined && { currency: dto.currency.trim() || 'INR' }),
                    ...(dto.description !== undefined && {
                        description: dto.description?.trim() || null,
                    }),
                    ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
            });
            return this.serialize(row);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.BadRequestException('A plan with this code already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.paymentPlan.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.PaymentPlansService = PaymentPlansService;
exports.PaymentPlansService = PaymentPlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentPlansService);
//# sourceMappingURL=payment-plans.service.js.map