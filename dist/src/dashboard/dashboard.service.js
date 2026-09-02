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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const state_scope_1 = require("../common/utils/state-scope");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(currentUser) {
        const stateId = (0, state_scope_1.resolveScopedStateId)(currentUser);
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const userWhere = {
            role: { name: client_1.RoleName.END_USER },
            ...(stateId ? { stateId } : {}),
        };
        const providerWhere = stateId ? { stateId } : {};
        const [totalUsers, activeUsers, inactiveUsers, totalServiceProviders, activeServiceProviders, inactiveServiceProviders, listings, activeListings, listEnquiries, productEnquiries, last7ActiveUsers, last7ActiveServiceProviders, last7ActiveListings,] = await Promise.all([
            this.prisma.user.count({ where: userWhere }),
            this.prisma.user.count({ where: { ...userWhere, isActive: true } }),
            this.prisma.user.count({ where: { ...userWhere, isActive: false } }),
            this.prisma.serviceProvider.count({ where: providerWhere }),
            this.prisma.serviceProvider.count({ where: { ...providerWhere, isActive: true } }),
            this.prisma.serviceProvider.count({ where: { ...providerWhere, isActive: false } }),
            this.prisma.marketplaceProduct.count(),
            this.prisma.marketplaceProduct.count({ where: { isActive: true } }),
            this.prisma.enquiry.count({ where: { kind: 'PROVIDER' } }),
            this.prisma.enquiry.count({ where: { kind: 'PRODUCT' } }),
            this.prisma.user.count({
                where: { ...userWhere, isActive: true, createdAt: { gte: since } },
            }),
            this.prisma.serviceProvider.count({
                where: { ...providerWhere, isActive: true, createdAt: { gte: since } },
            }),
            this.prisma.marketplaceProduct.count({
                where: { isActive: true, createdAt: { gte: since } },
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalServiceProviders,
            activeServiceProviders,
            inactiveServiceProviders,
            listings,
            activeListings,
            listEnquiries,
            productEnquiries,
            last7ActiveUsers,
            last7ActiveServiceProviders,
            last7ActiveListings,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map