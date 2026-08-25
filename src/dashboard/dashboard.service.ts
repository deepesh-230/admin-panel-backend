import { Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { resolveScopedStateId } from '../common/utils/state-scope';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(currentUser: AuthUser) {
    const stateId = resolveScopedStateId(currentUser);
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const userWhere = {
      role: { name: RoleName.END_USER },
      ...(stateId ? { stateId } : {}),
    };
    const providerWhere = stateId ? { stateId } : {};

    const [
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
    ] = await Promise.all([
      this.prisma.user.count({ where: userWhere }),
      this.prisma.user.count({ where: { ...userWhere, isActive: true } }),
      this.prisma.user.count({ where: { ...userWhere, isActive: false } }),
      this.prisma.serviceProvider.count({ where: providerWhere }),
      this.prisma.serviceProvider.count({ where: { ...providerWhere, isActive: true } }),
      this.prisma.serviceProvider.count({ where: { ...providerWhere, isActive: false } }),
      this.prisma.marketplaceProduct.count(),
      this.prisma.marketplaceProduct.count({ where: { isActive: true } }),
      this.prisma.enquiry.count({ where: { kind: 'PROVIDER' } }),
      this.prisma.enquiry.count({ where: { kind: 'USER' } }),
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
}
