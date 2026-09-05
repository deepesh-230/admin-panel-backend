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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const paymentInclude = {
    user: { select: { id: true, name: true, email: true, phone: true } },
};
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    sanitize(row) {
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
    async findAll(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.purpose)
            where.purpose = query.purpose;
        if (query.from || query.to) {
            const paidAt = {};
            if (query.from)
                paidAt.gte = new Date(query.from);
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
                where: { status: client_1.PaymentStatus.SUCCESS },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PENDING } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.FAILED } }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.REFUNDED } }),
        ]);
        return {
            successCount: successAgg._count,
            successAmount: Number(successAgg._sum.amount ?? 0),
            pendingCount: pending,
            failedCount: failed,
            refundedCount: refunded,
        };
    }
    async findOne(id) {
        const row = await this.prisma.payment.findUnique({
            where: { id },
            include: paymentInclude,
        });
        if (!row)
            throw new common_1.NotFoundException('Payment not found');
        return this.sanitize(row);
    }
    async create(dto) {
        if (dto.paymentId) {
            const existing = await this.prisma.payment.findUnique({
                where: { paymentId: dto.paymentId },
            });
            if (existing) {
                throw new common_1.ConflictException('Payment ID already exists');
            }
        }
        const status = dto.status ?? client_1.PaymentStatus.PENDING;
        const paidAt = dto.paidAt !== undefined
            ? new Date(dto.paidAt)
            : status === client_1.PaymentStatus.SUCCESS
                ? new Date()
                : undefined;
        const purpose = dto.purpose ?? client_1.PaymentPurpose.OTHER;
        const validUntil = status === client_1.PaymentStatus.SUCCESS && purpose === client_1.PaymentPurpose.SPONSORSHIP && paidAt
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Payment ID already exists');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.paymentId) {
            const clash = await this.prisma.payment.findFirst({
                where: { paymentId: dto.paymentId, NOT: { id } },
            });
            if (clash)
                throw new common_1.ConflictException('Payment ID already exists');
        }
        const nextStatus = dto.status;
        let paidAt = undefined;
        let validUntil = undefined;
        const current = await this.prisma.payment.findUnique({ where: { id } });
        if (dto.paidAt !== undefined) {
            paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
        }
        else if (nextStatus === client_1.PaymentStatus.SUCCESS) {
            if (current && !current.paidAt)
                paidAt = new Date();
        }
        else if (nextStatus === client_1.PaymentStatus.PENDING ||
            nextStatus === client_1.PaymentStatus.FAILED ||
            nextStatus === client_1.PaymentStatus.CANCELLED) {
            paidAt = null;
            validUntil = null;
        }
        const effectivePurpose = dto.purpose ?? current?.purpose;
        const effectivePaidAt = paidAt === undefined ? current?.paidAt : paidAt;
        if ((nextStatus === client_1.PaymentStatus.SUCCESS || current?.status === client_1.PaymentStatus.SUCCESS) &&
            effectivePurpose === client_1.PaymentPurpose.SPONSORSHIP &&
            effectivePaidAt &&
            !current?.validUntil) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Payment ID already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.payment.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map