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
exports.EnquiriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const enquiryInclude = {
    provider: { select: { id: true, name: true, stateId: true } },
    state: { select: { id: true, name: true, code: true } },
};
let EnquiriesService = class EnquiriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(currentUser, searchQuery, kind, status) {
        const where = {
            AND: [await this.scopeWhere(currentUser)],
        };
        if (kind) {
            where.AND.push({ kind });
        }
        if (status) {
            where.AND.push({ status });
        }
        if (searchQuery) {
            where.AND.push({
                OR: [
                    { product: { contains: searchQuery, mode: 'insensitive' } },
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { email: { contains: searchQuery, mode: 'insensitive' } },
                    { category: { contains: searchQuery, mode: 'insensitive' } },
                ],
            });
        }
        return this.prisma.enquiry.findMany({
            where,
            include: enquiryInclude,
            orderBy: { sNo: 'asc' },
        });
    }
    async findOne(id, currentUser) {
        const enquiry = await this.prisma.enquiry.findUnique({
            where: { id },
            include: enquiryInclude,
        });
        if (!enquiry)
            throw new common_1.NotFoundException(`Enquiry with ID ${id} not found`);
        await this.assertCanAccess(currentUser, enquiry);
        return enquiry;
    }
    async create(currentUser, data) {
        const resolved = await this.resolveWriteFields(currentUser, data);
        const last = await this.prisma.enquiry.findFirst({ orderBy: { sNo: 'desc' } });
        const nextSNo = (last?.sNo ?? 0) + 1;
        return this.prisma.enquiry.create({
            data: {
                category: data.category,
                subCategory: data.subCategory,
                product: data.product,
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                date: data.date,
                createdBy: data.createdBy,
                kind: resolved.kind,
                status: data.status ?? client_1.EnquiryStatus.NEW,
                providerId: resolved.providerId,
                stateId: resolved.stateId,
                marketplaceProductId: data.marketplaceProductId,
                sNo: nextSNo,
            },
            include: enquiryInclude,
        });
    }
    async update(id, currentUser, data) {
        const existing = await this.findOne(id, currentUser);
        const resolved = await this.resolveWriteFields(currentUser, {
            kind: data.kind ?? existing.kind,
            providerId: data.providerId !== undefined ? data.providerId : existing.providerId ?? undefined,
            stateId: data.stateId !== undefined ? data.stateId : existing.stateId ?? undefined,
        });
        return this.prisma.enquiry.update({
            where: { id },
            data: {
                ...(data.category !== undefined && { category: data.category }),
                ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
                ...(data.product !== undefined && { product: data.product }),
                ...(data.name !== undefined && { name: data.name }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.date !== undefined && { date: data.date }),
                ...(data.createdBy !== undefined && { createdBy: data.createdBy }),
                ...(data.status !== undefined && { status: data.status }),
                kind: resolved.kind,
                providerId: resolved.providerId,
                stateId: resolved.stateId,
            },
            include: enquiryInclude,
        });
    }
    async remove(id, currentUser) {
        await this.findOne(id, currentUser);
        return this.prisma.enquiry.delete({ where: { id } });
    }
    async scopeWhere(currentUser) {
        if (currentUser.role === client_1.RoleName.ADMIN)
            return {};
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (!currentUser.stateId)
                return { id: { in: [] } };
            return { stateId: currentUser.stateId };
        }
        if (currentUser.role === client_1.RoleName.SERVICE_PROVIDER_ADMIN) {
            const ids = await this.assignedProviderIds(currentUser.id);
            return { providerId: { in: ids } };
        }
        if (currentUser.role === client_1.RoleName.VOLUNTEER) {
            return { kind: 'USER' };
        }
        return { id: { in: [] } };
    }
    async assertCanAccess(currentUser, enquiry) {
        if (currentUser.role === client_1.RoleName.ADMIN)
            return;
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            if (!currentUser.stateId || enquiry.stateId !== currentUser.stateId) {
                throw new common_1.ForbiddenException('You can only access enquiries in your assigned state');
            }
            return;
        }
        if (currentUser.role === client_1.RoleName.SERVICE_PROVIDER_ADMIN) {
            const ids = await this.assignedProviderIds(currentUser.id);
            if (!enquiry.providerId || !ids.includes(enquiry.providerId)) {
                throw new common_1.ForbiddenException('You can only access enquiries for your assigned providers');
            }
            return;
        }
        if (currentUser.role === client_1.RoleName.VOLUNTEER) {
            if (enquiry.kind !== 'USER') {
                throw new common_1.ForbiddenException('Volunteers can only access user enquiries');
            }
            return;
        }
        throw new common_1.ForbiddenException('You cannot access this enquiry');
    }
    async assignedProviderIds(userId) {
        const rows = await this.prisma.serviceProviderAdmin.findMany({
            where: { userId },
            select: { serviceProviderId: true },
        });
        const ids = rows.map((r) => r.serviceProviderId);
        return ids.length ? ids : ['__none__'];
    }
    async resolveWriteFields(currentUser, data) {
        let kind = data.kind || 'USER';
        let providerId = data.providerId || null;
        let stateId = data.stateId || null;
        if (currentUser.role === client_1.RoleName.VOLUNTEER) {
            kind = 'USER';
            providerId = null;
        }
        if (currentUser.role === client_1.RoleName.STATE_ADMIN) {
            stateId = currentUser.stateId ?? null;
        }
        if (currentUser.role === client_1.RoleName.SERVICE_PROVIDER_ADMIN) {
            const ids = await this.assignedProviderIds(currentUser.id);
            const usable = ids.filter((id) => id !== '__none__');
            if (!usable.length) {
                throw new common_1.ForbiddenException('No providers are assigned to this account');
            }
            if (!providerId) {
                if (usable.length === 1)
                    providerId = usable[0];
                else
                    throw new common_1.ForbiddenException('Select one of your assigned providers');
            }
            if (!usable.includes(providerId)) {
                throw new common_1.ForbiddenException('You can only attach enquiries to your assigned providers');
            }
        }
        if (providerId) {
            const provider = await this.prisma.serviceProvider.findUnique({
                where: { id: providerId },
                select: { id: true, stateId: true },
            });
            if (!provider)
                throw new common_1.NotFoundException('Service provider not found');
            stateId = provider.stateId;
        }
        return { kind, providerId, stateId };
    }
};
exports.EnquiriesService = EnquiriesService;
exports.EnquiriesService = EnquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnquiriesService);
//# sourceMappingURL=enquiries.service.js.map