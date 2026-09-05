import { Injectable } from '@nestjs/common';
import {
  AdminLifecycleFlag,
  MarketplaceApprovalStatus,
  ProviderApprovalStatus,
  RoleName,
} from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { resolveScopedStateId } from '../common/utils/state-scope';
import { PrismaService } from '../prisma/prisma.service';

const TRACKED_USER_ROLES: RoleName[] = [
  RoleName.END_USER,
  RoleName.SERVICE_PROVIDER_ADMIN,
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /** Soft-deleted records flagged DELETE older than 60 days are hard-removed. */
  async purgeDeleted(olderThanDays = 60) {
    const cutoff = addDays(new Date(), -olderThanDays);
    const [enquiries, suggestions, jobAlerts, events, products] = await Promise.all([
      this.prisma.enquiry.deleteMany({
        where: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: { lte: cutoff } },
      }),
      this.prisma.suggestion.deleteMany({
        where: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: { lte: cutoff } },
      }),
      this.prisma.jobAlert.deleteMany({
        where: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: { lte: cutoff } },
      }),
      this.prisma.event.deleteMany({
        where: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: { lte: cutoff } },
      }),
      this.prisma.marketplaceProduct.deleteMany({
        where: { adminFlag: AdminLifecycleFlag.DELETE, deletedAt: { lte: cutoff } },
      }),
    ]);

    return {
      purged: {
        enquiries: enquiries.count,
        suggestions: suggestions.count,
        jobAlerts: jobAlerts.count,
        events: events.count,
        marketplaceProducts: products.count,
      },
      cutoff: cutoff.toISOString(),
    };
  }

  async getStats(
    currentUser: AuthUser,
    range?: { from?: string; to?: string },
  ) {
    await this.purgeDeleted().catch(() => undefined);

    const stateId = resolveScopedStateId(currentUser);
    const now = new Date();
    const since7 = addDays(now, -7);
    const windowStart = range?.from ? new Date(range.from) : startOfDay(now);
    const windowEnd = range?.to ? new Date(range.to) : addDays(startOfDay(now), 30);
    const isCentralAdmin = currentUser.role === RoleName.ADMIN;

    const userStateFilter = stateId ? { stateId } : {};
    const providerStateFilter = stateId ? { stateId } : {};
    const productStateFilter = stateId ? { stateId } : {};

    const [
      activeUsers,
      totalServiceProviders,
      activeServiceProviders,
      openEnquiries,
      closedEnquiries,
      newSaleListings7d,
      suggestionsOpen,
      suggestionsClosed,
      suggestionsTotal,
      pushNotifications,
      pushUnread,
      activeJobAlerts,
      latestJobAlerts,
      activeEvents,
      usersByState,
      providersByState,
      salesByState,
      enquiryCentral,
      enquiryProvider,
      saleApproved,
      salePending,
      saleRejected,
      verifiedProviders,
      unverifiedProviders,
      volunteerByState,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          isActive: true,
          role: { name: { in: TRACKED_USER_ROLES } },
          ...userStateFilter,
        },
      }),
      this.prisma.serviceProvider.count({ where: providerStateFilter }),
      this.prisma.serviceProvider.count({
        where: { ...providerStateFilter, isActive: true },
      }),
      this.prisma.enquiry.count({
        where: {
          status: { in: ['NEW', 'CONTACTED'] },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...(stateId ? { stateId } : {}),
        },
      }),
      this.prisma.enquiry.count({
        where: {
          status: 'CLOSED',
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...(stateId ? { stateId } : {}),
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          createdAt: { gte: since7 },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.prisma.suggestion.count({
        where: {
          status: { in: ['OPEN', 'NEW', 'PENDING'] },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
        },
      }),
      this.prisma.suggestion.count({
        where: {
          status: { in: ['CLOSED', 'RESOLVED', 'DONE'] },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
        },
      }),
      this.prisma.suggestion.count({
        where: { adminFlag: { not: AdminLifecycleFlag.DELETE }, deletedAt: null },
      }),
      this.prisma.userBroadcast.count(),
      this.prisma.userBroadcast.count({ where: { readAt: null } }),
      this.prisma.jobAlert.count({
        where: {
          isActive: true,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          OR: [
            {
              AND: [
                { startsAt: { lte: windowEnd } },
                {
                  OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
                },
              ],
            },
            {
              AND: [{ startsAt: null }, { endsAt: null }, { isActive: true }],
            },
          ],
        },
      }),
      this.prisma.jobAlert.findMany({
        where: {
          isActive: true,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, postDate: true, lastDate: true, startsAt: true, endsAt: true, createdAt: true },
      }),
      this.prisma.event.groupBy({
        by: ['location'],
        where: {
          isActive: true,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          startsAt: { lte: windowEnd },
          OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
        },
        _count: { _all: true },
      }),
      this.groupUsersByState(stateId),
      this.groupProvidersByState(stateId),
      this.groupSalesByState(stateId),
      this.prisma.enquiry.count({
        where: {
          providerId: null,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...(stateId ? { stateId } : {}),
        },
      }),
      this.prisma.enquiry.count({
        where: {
          providerId: { not: null },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...(stateId ? { stateId } : {}),
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          approvalStatus: MarketplaceApprovalStatus.APPROVED,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          approvalStatus: MarketplaceApprovalStatus.PENDING,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          approvalStatus: MarketplaceApprovalStatus.REJECTED,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.prisma.serviceProvider.count({
        where: {
          ...providerStateFilter,
          approvalStatus: ProviderApprovalStatus.APPROVED,
        },
      }),
      this.prisma.serviceProvider.count({
        where: {
          ...providerStateFilter,
          approvalStatus: { not: ProviderApprovalStatus.APPROVED },
        },
      }),
      this.groupVolunteersByState(stateId),
    ]);

    // Backward-compatible flat fields + ticket overview
    const [
      totalUsers,
      inactiveUsers,
      listings,
      activeListings,
      listEnquiries,
      productEnquiries,
      last7ActiveUsers,
      last7ActiveServiceProviders,
      last7ActiveListings,
      salesBreakdown,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { role: { name: { in: TRACKED_USER_ROLES } }, ...userStateFilter },
      }),
      this.prisma.user.count({
        where: {
          isActive: false,
          role: { name: { in: TRACKED_USER_ROLES } },
          ...userStateFilter,
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: { adminFlag: { not: AdminLifecycleFlag.DELETE }, deletedAt: null, ...productStateFilter },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          isActive: true,
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.prisma.enquiry.count({
        where: {
          kind: 'PROVIDER',
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
        },
      }),
      this.prisma.enquiry.count({
        where: {
          kind: { in: ['PRODUCT', 'USER'] },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          isActive: true,
          role: { name: { in: TRACKED_USER_ROLES } },
          createdAt: { gte: since7 },
          ...userStateFilter,
        },
      }),
      this.prisma.serviceProvider.count({
        where: { ...providerStateFilter, isActive: true, createdAt: { gte: since7 } },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          isActive: true,
          createdAt: { gte: since7 },
          adminFlag: { not: AdminLifecycleFlag.DELETE },
          deletedAt: null,
          ...productStateFilter,
        },
      }),
      this.salesSubmitterBreakdown(stateId),
    ]);

    const centralAdmin = isCentralAdmin
      ? await this.centralAdminExtras(now)
      : null;

    return {
      // legacy flat cards
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalServiceProviders,
      activeServiceProviders,
      inactiveServiceProviders: totalServiceProviders - activeServiceProviders,
      listings,
      activeListings,
      listEnquiries,
      productEnquiries,
      last7ActiveUsers,
      last7ActiveServiceProviders,
      last7ActiveListings,

      // title counters
      overview: {
        activeUsers,
        serviceProviders: totalServiceProviders,
        enquiries: openEnquiries + closedEnquiries,
        openEnquiries,
        closedEnquiries,
        newSaleListingsLast7Days: newSaleListings7d,
        suggestions: suggestionsTotal,
        pushNotifications,
        pushUnread,
        activeJobAlerts,
        latestJobAlerts,
      },

      users: {
        byState: usersByState,
        volunteersByState: volunteerByState,
      },

      serviceProviders: {
        byState: providersByState,
        verified: verifiedProviders,
        unverified: unverifiedProviders,
      },

      sales: {
        byState: salesByState,
        approved: saleApproved,
        unapproved: salePending,
        rejected: saleRejected,
        last7Days: newSaleListings7d,
        bySubmitter: salesBreakdown,
      },

      enquiries: {
        centralAdmin: enquiryCentral,
        providerAdmin: enquiryProvider,
        open: openEnquiries,
        closed: closedEnquiries,
      },

      suggestions: {
        total: suggestionsTotal,
        open: suggestionsOpen,
        closed: suggestionsClosed,
        byStatus: await this.suggestionsByStatus(),
      },

        jobAlerts: {
        activeInWindow: activeJobAlerts,
        windowDays: Math.max(
          1,
          Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)),
        ),
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        latest: latestJobAlerts,
      },

      events: {
        windowDays: Math.max(
          1,
          Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)),
        ),
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        byLocation: activeEvents.map((row) => ({
          location: row.location || 'Unspecified',
          count: row._count._all,
        })),
        total: activeEvents.reduce((sum, row) => sum + row._count._all, 0),
      },

      centralAdmin,
    };
  }

  /** One-time-ish data fixes for legacy rows. */
  async backfill() {
    const now = new Date();
    const [verifiedUsers, approvedSales, sponsorValidity] = await Promise.all([
      this.prisma.user.updateMany({
        where: { emailVerifiedAt: null, isActive: true },
        data: { emailVerifiedAt: now },
      }),
      this.prisma.marketplaceProduct.updateMany({
        where: { isActive: true, approvalStatus: 'PENDING' },
        data: { approvalStatus: 'APPROVED' },
      }),
      this.prisma.payment.updateMany({
        where: {
          purpose: 'SPONSORSHIP',
          status: 'SUCCESS',
          validUntil: null,
          paidAt: { not: null },
        },
        data: {},
      }),
    ]);

    const sponsorsNeedingValidity = await this.prisma.payment.findMany({
      where: {
        purpose: 'SPONSORSHIP',
        status: 'SUCCESS',
        validUntil: null,
        paidAt: { not: null },
      },
      select: { id: true, paidAt: true },
    });
    for (const row of sponsorsNeedingValidity) {
      if (!row.paidAt) continue;
      await this.prisma.payment.update({
        where: { id: row.id },
        data: {
          validUntil: new Date(row.paidAt.getTime() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return {
      verifiedUsers: verifiedUsers.count,
      approvedSales: approvedSales.count,
      sponsorValiditySet: sponsorsNeedingValidity.length,
      noopSponsorUpdateMany: sponsorValidity.count,
    };
  }

  private async groupUsersByState(stateId?: string) {
    const rows = await this.prisma.user.findMany({
      where: {
        role: { name: { in: TRACKED_USER_ROLES } },
        ...(stateId ? { stateId } : {}),
      },
      select: {
        stateId: true,
        emailVerifiedAt: true,
        isActive: true,
        role: { select: { name: true } },
        state: { select: { name: true } },
      },
    });

    type Bucket = {
      stateId: string | null;
      stateName: string;
      submitted: { endUser: number; providerAdmin: number };
      verified: { endUser: number; providerAdmin: number };
      unverified: { endUser: number; providerAdmin: number };
    };

    const map = new Map<string, Bucket>();
    const keyOf = (id: string | null) => id || '__none__';

    for (const row of rows) {
      const key = keyOf(row.stateId);
      if (!map.has(key)) {
        map.set(key, {
          stateId: row.stateId,
          stateName: row.state?.name || 'Unassigned',
          submitted: { endUser: 0, providerAdmin: 0 },
          verified: { endUser: 0, providerAdmin: 0 },
          unverified: { endUser: 0, providerAdmin: 0 },
        });
      }
      const bucket = map.get(key)!;
      const roleKey =
        row.role.name === RoleName.SERVICE_PROVIDER_ADMIN ? 'providerAdmin' : 'endUser';
      bucket.submitted[roleKey] += 1;
      if (row.emailVerifiedAt) bucket.verified[roleKey] += 1;
      else bucket.unverified[roleKey] += 1;
    }

    return [...map.values()].sort((a, b) => a.stateName.localeCompare(b.stateName));
  }

  private async groupVolunteersByState(stateId?: string) {
    const rows = await this.prisma.user.groupBy({
      by: ['stateId'],
      where: {
        role: { name: RoleName.VOLUNTEER },
        ...(stateId ? { stateId } : {}),
      },
      _count: { _all: true },
    });
    const stateIds = rows.map((r) => r.stateId).filter(Boolean) as string[];
    const states = stateIds.length
      ? await this.prisma.state.findMany({
          where: { id: { in: stateIds } },
          select: { id: true, name: true },
        })
      : [];
    const names = new Map(states.map((s) => [s.id, s.name]));
    return rows.map((r) => ({
      stateId: r.stateId,
      stateName: (r.stateId && names.get(r.stateId)) || 'Unassigned',
      count: r._count._all,
    }));
  }

  private async groupProvidersByState(stateId?: string) {
    const rows = await this.prisma.serviceProvider.groupBy({
      by: ['stateId', 'approvalStatus'],
      where: stateId ? { stateId } : {},
      _count: { _all: true },
    });
    const stateIds = [...new Set(rows.map((r) => r.stateId))];
    const states = await this.prisma.state.findMany({
      where: { id: { in: stateIds } },
      select: { id: true, name: true },
    });
    const names = new Map(states.map((s) => [s.id, s.name]));
    const map = new Map<
      string,
      { stateId: string; stateName: string; total: number; verified: number; unverified: number }
    >();
    for (const row of rows) {
      if (!map.has(row.stateId)) {
        map.set(row.stateId, {
          stateId: row.stateId,
          stateName: names.get(row.stateId) || 'Unknown',
          total: 0,
          verified: 0,
          unverified: 0,
        });
      }
      const bucket = map.get(row.stateId)!;
      bucket.total += row._count._all;
      if (row.approvalStatus === ProviderApprovalStatus.APPROVED) {
        bucket.verified += row._count._all;
      } else {
        bucket.unverified += row._count._all;
      }
    }
    return [...map.values()].sort((a, b) => a.stateName.localeCompare(b.stateName));
  }

  private async groupSalesByState(stateId?: string) {
    const rows = await this.prisma.marketplaceProduct.groupBy({
      by: ['stateId'],
      where: {
        adminFlag: { not: AdminLifecycleFlag.DELETE },
        deletedAt: null,
        ...(stateId ? { stateId } : {}),
      },
      _count: { _all: true },
    });
    const stateIds = rows.map((r) => r.stateId).filter(Boolean) as string[];
    const states = stateIds.length
      ? await this.prisma.state.findMany({
          where: { id: { in: stateIds } },
          select: { id: true, name: true },
        })
      : [];
    const names = new Map(states.map((s) => [s.id, s.name]));
    return rows.map((r) => ({
      stateId: r.stateId,
      stateName: (r.stateId && names.get(r.stateId)) || 'Unassigned',
      count: r._count._all,
    }));
  }

  private async salesSubmitterBreakdown(stateId?: string) {
    const products = await this.prisma.marketplaceProduct.findMany({
      where: {
        adminFlag: { not: AdminLifecycleFlag.DELETE },
        deletedAt: null,
        ...(stateId ? { stateId } : {}),
      },
      select: {
        approvalStatus: true,
        createdBy: {
          select: {
            emailVerifiedAt: true,
            role: { select: { name: true } },
          },
        },
      },
    });

    const empty = () => ({
      endUserVerified: 0,
      endUserUnverified: 0,
      providerAdminVerified: 0,
      providerAdminUnverified: 0,
      unknown: 0,
    });

    const result = {
      approved: empty(),
      unapproved: empty(),
    };

    for (const p of products) {
      const bucket =
        p.approvalStatus === MarketplaceApprovalStatus.APPROVED
          ? result.approved
          : result.unapproved;
      const role = p.createdBy?.role.name;
      const verified = Boolean(p.createdBy?.emailVerifiedAt);
      if (role === RoleName.END_USER) {
        if (verified) bucket.endUserVerified += 1;
        else bucket.endUserUnverified += 1;
      } else if (role === RoleName.SERVICE_PROVIDER_ADMIN) {
        if (verified) bucket.providerAdminVerified += 1;
        else bucket.providerAdminUnverified += 1;
      } else {
        bucket.unknown += 1;
      }
    }

    return result;
  }

  private async suggestionsByStatus() {
    const rows = await this.prisma.suggestion.groupBy({
      by: ['status'],
      where: { adminFlag: { not: AdminLifecycleFlag.DELETE }, deletedAt: null },
      _count: { _all: true },
    });
    return rows.map((r) => ({ status: r.status, count: r._count._all }));
  }

  private async centralAdminExtras(now: Date) {
    const stateAdmins = await this.prisma.user.findMany({
      where: { role: { name: RoleName.STATE_ADMIN } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        state: { select: { id: true, name: true, code: true } },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            revokedAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const activeSponsors = await this.prisma.payment.count({
      where: {
        purpose: 'SPONSORSHIP',
        status: 'SUCCESS',
        OR: [{ validUntil: { gte: now } }, { validUntil: null, paidAt: { gte: addDays(now, -365) } }],
      },
    });

    const invalidSponsors = await this.prisma.payment.count({
      where: {
        purpose: 'SPONSORSHIP',
        status: 'SUCCESS',
        validUntil: { lt: now },
      },
    });

    const recentSponsors = await this.prisma.payment.findMany({
      where: { purpose: 'SPONSORSHIP', status: 'SUCCESS' },
      orderBy: { paidAt: 'desc' },
      take: 20,
      select: {
        id: true,
        payerName: true,
        payerEmail: true,
        amount: true,
        planId: true,
        paidAt: true,
        validUntil: true,
        status: true,
      },
    });

    return {
      stateAdmins: stateAdmins.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        isActive: admin.isActive,
        state: admin.state,
        sessions: admin.sessions.map((s) => ({
          id: s.id,
          loginAt: s.createdAt,
          logoutAt: s.revokedAt,
          expiresAt: s.expiresAt,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          isActive: !s.revokedAt && s.expiresAt > now,
        })),
      })),
      sponsors: {
        activeCount: activeSponsors,
        invalidCount: invalidSponsors,
        recent: recentSponsors.map((p) => ({
          ...p,
          amount: Number(p.amount),
          isValid: p.validUntil ? p.validUntil >= now : Boolean(p.paidAt && p.paidAt >= addDays(now, -365)),
        })),
      },
    };
  }
}
