import { Injectable, Logger } from '@nestjs/common';
import {
  AdminLifecycleFlag,
  MarketplaceApprovalStatus,
  Prisma,
  ProviderApprovalStatus,
  RoleName,
} from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { assignedStateIds } from '../common/utils/state-scope';
import { TtlCache } from '../common/utils/ttl-cache';
import { PrismaService } from '../prisma/prisma.service';

const statsCache = new TtlCache();
const STATS_TTL_MS = 60_000;
const QUERY_CONCURRENCY = 4;

function asNum(value: unknown) {
  return Number(value || 0);
}

function asList<T>(value: unknown): T[] {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? (value as T[]) : [];
}

const TRACKED_USER_ROLES: RoleName[] = [
  RoleName.END_USER,
  RoleName.SERVICE_PROVIDER_ADMIN,
];

const OPEN_ENQUIRY = new Set(['NEW', 'CONTACTED']);
const OPEN_SUGGESTION = new Set(['OPEN', 'NEW', 'PENDING']);
const CLOSED_SUGGESTION = new Set(['CLOSED', 'RESOLVED', 'DONE']);

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

function normalizePlanCode(planId: string | null | undefined) {
  const code = (planId || '').trim().toLowerCase();
  if (!code) return 'other';
  if (code === 'diamond') return 'platinum';
  if (code === 'platinum' || code === 'gold' || code === 'silver') return code;
  return 'other';
}

function isSponsorshipActive(
  now: Date,
  validUntil: Date | null,
  paidAt: Date | null,
) {
  if (validUntil) return validUntil >= now;
  return Boolean(paidAt && paidAt >= addDays(now, -365));
}

function sqlStateIn(column: Prisma.Sql, stateIds: string[] | null) {
  if (!stateIds) return Prisma.sql`AND TRUE`;
  const ids = stateIds.length ? stateIds : ['__none__'];
  return Prisma.sql`AND ${column} IN (${Prisma.join(ids)})`;
}

function prismaStateIn(stateIds: string[] | null): { in: string[] } | undefined {
  if (!stateIds) return undefined;
  return { in: stateIds.length ? stateIds : ['__none__'] };
}

async function runPool(fns: Array<() => Promise<unknown>>, limit = QUERY_CONCURRENCY): Promise<unknown[]> {
  const out: unknown[] = new Array(fns.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, fns.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= fns.length) return;
      out[i] = await fns[i]();
    }
  });
  await Promise.all(workers);
  return out;
}

type RoleCounts = { endUser: number; providerAdmin: number };
type SubmitterCounts = {
  endUserVerified: number;
  endUserUnverified: number;
  providerAdminVerified: number;
  providerAdminUnverified: number;
  unknown: number;
};

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

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
    const stateIds =
      currentUser.role === RoleName.STATE_ADMIN ? assignedStateIds(currentUser) : null;
    const now = new Date();
    const since7 = addDays(now, -7);
    const windowStart = range?.from ? new Date(range.from) : startOfDay(now);
    const windowEnd = range?.to ? new Date(range.to) : addDays(startOfDay(now), 30);
    const isCentralAdmin = currentUser.role === RoleName.ADMIN;
    const cacheKey = `stats:${currentUser.role}:${stateIds?.join(',') || 'all'}:${windowStart.toISOString().slice(0, 10)}:${windowEnd.toISOString().slice(0, 10)}`;
    const cached = statsCache.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const notDeleted = {
      adminFlag: { not: AdminLifecycleFlag.DELETE } as const,
      deletedAt: null,
    };

    const started = Date.now();
    try {
      try {
        const fast = await this.loadFastStats(
          stateIds,
          now,
          since7,
          windowStart,
          windowEnd,
          isCentralAdmin,
        );
        statsCache.set(cacheKey, fast, STATS_TTL_MS);
        this.logger.log(`getStats ${Date.now() - started}ms (fast)`);
        return fast;
      } catch (fastErr) {
        this.logger.warn(
          `fast stats failed, using fallback: ${fastErr instanceof Error ? fastErr.message : fastErr}`,
        );
      }

      const [roles, states] = await Promise.all([
        this.prisma.role.findMany({ select: { id: true, name: true } }),
        this.prisma.state.findMany({ select: { id: true, name: true } }),
      ]);
      const roleById = new Map(roles.map((r) => [r.id, r.name]));
      const stateNames = new Map(states.map((s) => [s.id, s.name]));
      const trackedRoleIds = roles
        .filter((r) => TRACKED_USER_ROLES.includes(r.name))
        .map((r) => r.id);
      const volunteerRoleId = roles.find((r) => r.name === RoleName.VOLUNTEER)?.id;
      const userRoleIds = [...trackedRoleIds, ...(volunteerRoleId ? [volunteerRoleId] : [])];

      const userWhere: Prisma.UserWhereInput = { roleId: { in: userRoleIds } };
      const trackedUserWhere: Prisma.UserWhereInput = { roleId: { in: trackedRoleIds } };
      const providerWhere: Prisma.ServiceProviderWhereInput = {};
      const productWhere: Prisma.MarketplaceProductWhereInput = { ...notDeleted };
      const enquiryWhere: Prisma.EnquiryWhereInput = { ...notDeleted };
      const stateIn = prismaStateIn(stateIds);
      if (stateIn) {
        userWhere.stateId = stateIn;
        trackedUserWhere.stateId = stateIn;
        providerWhere.stateId = stateIn;
        productWhere.stateId = stateIn;
        enquiryWhere.stateId = stateIn;
      }

      const raw = await runPool([
        () =>
          this.prisma.user.groupBy({
            by: ['stateId', 'roleId', 'isActive'],
            where: userWhere,
            _count: { _all: true },
          }),
        () =>
          this.prisma.user.groupBy({
            by: ['stateId', 'roleId'],
            where: { ...trackedUserWhere, emailVerifiedAt: { not: null } },
            _count: { _all: true },
          }),
        () =>
          this.prisma.user.count({
            where: { ...trackedUserWhere, isActive: true, createdAt: { gte: since7 } },
          }),
        () =>
          this.prisma.serviceProvider.groupBy({
            by: ['stateId', 'isActive', 'approvalStatus'],
            where: providerWhere,
            _count: { _all: true },
          }),
        () =>
          this.prisma.serviceProvider.count({
            where: { ...providerWhere, isActive: true, createdAt: { gte: since7 } },
          }),
        () =>
          this.prisma.marketplaceProduct.groupBy({
            by: ['stateId', 'approvalStatus', 'isActive'],
            where: productWhere,
            _count: { _all: true },
          }),
        () =>
          this.prisma.marketplaceProduct.count({
            where: { ...productWhere, createdAt: { gte: since7 } },
          }),
        () =>
          this.prisma.marketplaceProduct.count({
            where: { ...productWhere, isActive: true, createdAt: { gte: since7 } },
          }),
        () =>
          this.prisma.enquiry.groupBy({
            by: ['status'],
            where: enquiryWhere,
            _count: { _all: true },
          }),
        () =>
            this.prisma.enquiry.groupBy({
            by: ['kind'],
            where: enquiryWhere,
            _count: { _all: true },
          }),
        () =>
          this.prisma.enquiry.count({
            where: { ...enquiryWhere, providerId: null },
          }),
        () =>
          this.prisma.enquiry.count({
            where: { ...enquiryWhere, providerId: { not: null } },
          }),
        () =>
          this.prisma.suggestion.groupBy({
            by: ['status'],
            where: notDeleted,
            _count: { _all: true },
          }),
        () => this.prisma.userBroadcast.count(),
        () => this.prisma.userBroadcast.count({ where: { readAt: null } }),
        () =>
          this.prisma.jobAlert.count({
            where: {
              isActive: true,
              ...notDeleted,
              OR: [
                {
                  AND: [
                    { startsAt: { lte: windowEnd } },
                    { OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }] },
                  ],
                },
                { AND: [{ startsAt: null }, { endsAt: null }, { isActive: true }] },
              ],
            },
          }),
        () =>
          this.prisma.jobAlert.findMany({
            where: { isActive: true, ...notDeleted },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              postDate: true,
              lastDate: true,
              startsAt: true,
              endsAt: true,
              createdAt: true,
            },
          }),
        () =>
          this.prisma.event.groupBy({
            by: ['location'],
            where: {
              isActive: true,
              ...notDeleted,
              startsAt: { lte: windowEnd },
              OR: [{ endsAt: null }, { endsAt: { gte: windowStart } }],
            },
            _count: { _all: true },
          }),
        () =>
          this.prisma.marketplaceProduct.groupBy({
            by: ['approvalStatus', 'createdById'],
            where: productWhere,
            _count: { _all: true },
          }),
        () =>
          this.prisma.payment.findMany({
            where: {
              purpose: 'SPONSORSHIP',
              status: 'SUCCESS',
              ...(stateIn ? { user: { stateId: stateIn } } : {}),
            },
            select: {
              planId: true,
              validUntil: true,
              paidAt: true,
              user: { select: { stateId: true } },
            },
          }),
        () => (isCentralAdmin ? this.centralAdminExtras(now) : Promise.resolve(null)),
      ]);

      type CountAll<T> = T & { _count: { _all: number } };
      const [
        userBuckets,
        userVerifiedBuckets,
        last7ActiveUsers,
        providerBuckets,
        last7ActiveServiceProviders,
        productBuckets,
        newSaleListings7d,
        last7ActiveListings,
        enquiryStatusBuckets,
        enquiryKindBuckets,
        enquiryCentral,
        enquiryProvider,
        suggestionBuckets,
        pushNotifications,
        pushUnread,
        activeJobAlerts,
        latestJobAlerts,
        activeEvents,
        salesSubmitterRows,
        payments,
        centralAdmin,
      ] = raw as [
        CountAll<{ stateId: string | null; roleId: string; isActive: boolean }>[],
        CountAll<{ stateId: string | null; roleId: string }>[],
        number,
        CountAll<{ stateId: string; isActive: boolean; approvalStatus: ProviderApprovalStatus }>[],
        number,
        CountAll<{
          stateId: string | null;
          approvalStatus: MarketplaceApprovalStatus;
          isActive: boolean;
        }>[],
        number,
        number,
        CountAll<{ status: string }>[],
        CountAll<{ kind: string }>[],
        number,
        number,
        CountAll<{ status: string }>[],
        number,
        number,
        number,
        Array<{
          id: string;
          title: string;
          postDate: Date | null;
          lastDate: Date | null;
          startsAt: Date | null;
          endsAt: Date | null;
          createdAt: Date;
        }>,
        CountAll<{ location: string | null }>[],
        CountAll<{ approvalStatus: MarketplaceApprovalStatus; createdById: string | null }>[],
        Array<{
          planId: string | null;
          validUntil: Date | null;
          paidAt: Date | null;
          user: { stateId: string | null } | null;
        }>,
        Awaited<ReturnType<DashboardService['centralAdminExtras']>> | null,
      ];

      const emptyRoleCounts = (): RoleCounts => ({ endUser: 0, providerAdmin: 0 });
      const usersByStateMap = new Map<
        string,
        {
          stateId: string | null;
          stateName: string;
          submitted: RoleCounts;
          verified: RoleCounts;
          unverified: RoleCounts;
        }
      >();
      const volunteerByStateMap = new Map<
        string,
        { stateId: string | null; stateName: string; count: number }
      >();
      const keyOf = (id: string | null) => id || '__none__';
      const ensureUserState = (id: string | null) => {
        const key = keyOf(id);
        let bucket = usersByStateMap.get(key);
        if (!bucket) {
          bucket = {
            stateId: id,
            stateName: (id && stateNames.get(id)) || 'Unassigned',
            submitted: emptyRoleCounts(),
            verified: emptyRoleCounts(),
            unverified: emptyRoleCounts(),
          };
          usersByStateMap.set(key, bucket);
        }
        return bucket;
      };

      let totalUsers = 0;
      let activeUsers = 0;
      for (const row of userBuckets) {
        const roleName = roleById.get(row.roleId);
        const count = row._count._all;
        if (roleName === RoleName.VOLUNTEER) {
          const key = keyOf(row.stateId);
          const existing = volunteerByStateMap.get(key);
          if (existing) existing.count += count;
          else {
            volunteerByStateMap.set(key, {
              stateId: row.stateId,
              stateName: (row.stateId && stateNames.get(row.stateId)) || 'Unassigned',
              count,
            });
          }
          continue;
        }
        if (roleName !== RoleName.END_USER && roleName !== RoleName.SERVICE_PROVIDER_ADMIN) {
          continue;
        }
        totalUsers += count;
        if (row.isActive) activeUsers += count;
        const roleKey = roleName === RoleName.SERVICE_PROVIDER_ADMIN ? 'providerAdmin' : 'endUser';
        ensureUserState(row.stateId).submitted[roleKey] += count;
      }
      for (const row of userVerifiedBuckets) {
        const roleName = roleById.get(row.roleId);
        const roleKey =
          roleName === RoleName.SERVICE_PROVIDER_ADMIN ? 'providerAdmin' : 'endUser';
        ensureUserState(row.stateId).verified[roleKey] += row._count._all;
      }
      for (const bucket of usersByStateMap.values()) {
        bucket.unverified.endUser = Math.max(0, bucket.submitted.endUser - bucket.verified.endUser);
        bucket.unverified.providerAdmin = Math.max(
          0,
          bucket.submitted.providerAdmin - bucket.verified.providerAdmin,
        );
      }

      let totalServiceProviders = 0;
      let activeServiceProviders = 0;
      let verifiedProviders = 0;
      const providersByStateMap = new Map<
        string,
        { stateId: string; stateName: string; total: number; verified: number; unverified: number }
      >();
      for (const row of providerBuckets) {
        const count = row._count._all;
        totalServiceProviders += count;
        if (row.isActive) activeServiceProviders += count;
        if (row.approvalStatus === ProviderApprovalStatus.APPROVED) verifiedProviders += count;
        if (!providersByStateMap.has(row.stateId)) {
          providersByStateMap.set(row.stateId, {
            stateId: row.stateId,
            stateName: stateNames.get(row.stateId) || 'Unknown',
            total: 0,
            verified: 0,
            unverified: 0,
          });
        }
        const bucket = providersByStateMap.get(row.stateId)!;
        bucket.total += count;
        if (row.approvalStatus === ProviderApprovalStatus.APPROVED) bucket.verified += count;
        else bucket.unverified += count;
      }

      let listings = 0;
      let activeListings = 0;
      let saleApproved = 0;
      let salePending = 0;
      let saleRejected = 0;
      const salesByStateMap = new Map<
        string,
        { stateId: string | null; stateName: string; count: number }
      >();
      for (const row of productBuckets) {
        const count = row._count._all;
        listings += count;
        if (row.isActive) activeListings += count;
        if (row.approvalStatus === MarketplaceApprovalStatus.APPROVED) saleApproved += count;
        else if (row.approvalStatus === MarketplaceApprovalStatus.PENDING) salePending += count;
        else if (row.approvalStatus === MarketplaceApprovalStatus.REJECTED) saleRejected += count;
        const key = keyOf(row.stateId);
        const existing = salesByStateMap.get(key);
        if (existing) existing.count += count;
        else {
          salesByStateMap.set(key, {
            stateId: row.stateId,
            stateName: (row.stateId && stateNames.get(row.stateId)) || 'Unassigned',
            count,
          });
        }
      }

      let openEnquiries = 0;
      let closedEnquiries = 0;
      for (const row of enquiryStatusBuckets) {
        if (OPEN_ENQUIRY.has(row.status)) openEnquiries += row._count._all;
        else if (row.status === 'CLOSED') closedEnquiries += row._count._all;
      }
      let listEnquiries = 0;
      let productEnquiries = 0;
      for (const row of enquiryKindBuckets) {
        if (row.kind === 'PROVIDER') listEnquiries += row._count._all;
        else if (row.kind === 'PRODUCT' || row.kind === 'USER') productEnquiries += row._count._all;
      }

      let suggestionsOpen = 0;
      let suggestionsClosed = 0;
      let suggestionsTotal = 0;
      const suggestionsByStatus = suggestionBuckets.map((row) => {
        suggestionsTotal += row._count._all;
        if (OPEN_SUGGESTION.has(row.status)) suggestionsOpen += row._count._all;
        if (CLOSED_SUGGESTION.has(row.status)) suggestionsClosed += row._count._all;
        return { status: row.status, count: row._count._all };
      });

      const submitterUserIds = [
        ...new Set(
          salesSubmitterRows.map((row) => row.createdById).filter((id): id is string => Boolean(id)),
        ),
      ];
      const submitterUsers = submitterUserIds.length
        ? await this.prisma.user.findMany({
            where: { id: { in: submitterUserIds } },
            select: { id: true, roleId: true, emailVerifiedAt: true },
          })
        : [];
      const submitterById = new Map(submitterUsers.map((u) => [u.id, u]));
      const emptySubmitters = (): SubmitterCounts => ({
        endUserVerified: 0,
        endUserUnverified: 0,
        providerAdminVerified: 0,
        providerAdminUnverified: 0,
        unknown: 0,
      });
      const salesBreakdown = {
        approved: emptySubmitters(),
        unapproved: emptySubmitters(),
      };
      for (const row of salesSubmitterRows) {
        const bucket =
          row.approvalStatus === MarketplaceApprovalStatus.APPROVED
            ? salesBreakdown.approved
            : salesBreakdown.unapproved;
        const count = row._count._all;
        const user = row.createdById ? submitterById.get(row.createdById) : undefined;
        const roleName = user ? roleById.get(user.roleId) : undefined;
        const verified = Boolean(user?.emailVerifiedAt);
        if (roleName === RoleName.END_USER) {
          if (verified) bucket.endUserVerified += count;
          else bucket.endUserUnverified += count;
        } else if (roleName === RoleName.SERVICE_PROVIDER_ADMIN) {
          if (verified) bucket.providerAdminVerified += count;
          else bucket.providerAdminUnverified += count;
        } else {
          bucket.unknown += count;
        }
      }

      type TierCounts = { platinum: number; gold: number; silver: number; other: number };
      const emptyTiers = (): TierCounts => ({ platinum: 0, gold: 0, silver: 0, other: 0 });
      let activeCount = 0;
      let inactiveCount = 0;
      const subscriptionByState = new Map<
        string,
        { stateId: string | null; stateName: string; active: TierCounts; inactive: TierCounts }
      >();
      for (const row of payments) {
        const active = isSponsorshipActive(now, row.validUntil, row.paidAt);
        if (active) activeCount += 1;
        else inactiveCount += 1;
        const sid = row.user?.stateId ?? null;
        const key = sid || '__unassigned__';
        let bucket = subscriptionByState.get(key);
        if (!bucket) {
          bucket = {
            stateId: sid,
            stateName: (sid && stateNames.get(sid)) || 'Unassigned',
            active: emptyTiers(),
            inactive: emptyTiers(),
          };
          subscriptionByState.set(key, bucket);
        }
        const tier = normalizePlanCode(row.planId) as keyof TierCounts;
        (active ? bucket.active : bucket.inactive)[tier] += 1;
      }

      const windowDays = Math.max(
        1,
        Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)),
      );

      const result = {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
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
          subscriptionCount: activeCount,
          inactiveSubscriptionCount: inactiveCount,
        },

        users: {
          byState: [...usersByStateMap.values()].sort((a, b) =>
            a.stateName.localeCompare(b.stateName),
          ),
          volunteersByState: [...volunteerByStateMap.values()].sort((a, b) =>
            a.stateName.localeCompare(b.stateName),
          ),
        },

        serviceProviders: {
          byState: [...providersByStateMap.values()].sort((a, b) =>
            a.stateName.localeCompare(b.stateName),
          ),
          verified: verifiedProviders,
          unverified: totalServiceProviders - verifiedProviders,
        },

        sales: {
          byState: [...salesByStateMap.values()],
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
          byStatus: suggestionsByStatus,
        },

        jobAlerts: {
          activeInWindow: activeJobAlerts,
          windowDays,
          windowStart: windowStart.toISOString(),
          windowEnd: windowEnd.toISOString(),
          latest: latestJobAlerts,
        },

        events: {
          windowDays,
          windowStart: windowStart.toISOString(),
          windowEnd: windowEnd.toISOString(),
          byLocation: activeEvents.map((row) => ({
            location: row.location || 'Unspecified',
            count: row._count._all,
          })),
          total: activeEvents.reduce((sum, row) => sum + row._count._all, 0),
        },

        subscriptions: {
          activeCount,
          inactiveCount,
          byState: [...subscriptionByState.values()].sort((a, b) =>
            a.stateName.localeCompare(b.stateName),
          ),
        },

        centralAdmin,
      };

      statsCache.set(cacheKey, result, STATS_TTL_MS);
      this.logger.log(`getStats ${Date.now() - started}ms`);
      return result;
    } catch (error) {
      this.logger.error(
        `getStats failed after ${Date.now() - started}ms`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private async loadFastStats(
    stateIds: string[] | null,
    now: Date,
    since7: Date,
    windowStart: Date,
    windowEnd: Date,
    isCentralAdmin: boolean,
  ) {
    const yearAgo = addDays(now, -365);
    const [row, centralAdmin] = await Promise.all([
      this.prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT
          (
            SELECT COUNT(*)::int FROM "User" u
            INNER JOIN "Role" r ON r.id = u."roleId"
            WHERE r.name::text IN ('END_USER', 'SERVICE_PROVIDER_ADMIN')
              ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
          ) AS "totalUsers",
          (
            SELECT COUNT(*)::int FROM "User" u
            INNER JOIN "Role" r ON r.id = u."roleId"
            WHERE r.name::text IN ('END_USER', 'SERVICE_PROVIDER_ADMIN')
              AND u."isActive" = true
              ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
          ) AS "activeUsers",
          (
            SELECT COUNT(*)::int FROM "User" u
            INNER JOIN "Role" r ON r.id = u."roleId"
            WHERE r.name::text IN ('END_USER', 'SERVICE_PROVIDER_ADMIN')
              AND u."isActive" = true
              AND u."createdAt" >= ${since7}
              ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
          ) AS "last7ActiveUsers",
          (
            SELECT COUNT(*)::int FROM "ServiceProvider" sp
            WHERE TRUE
              ${sqlStateIn(Prisma.sql`sp."stateId"`, stateIds)}
          ) AS "totalServiceProviders",
          (
            SELECT COUNT(*)::int FROM "ServiceProvider" sp
            WHERE sp."isActive" = true
              ${sqlStateIn(Prisma.sql`sp."stateId"`, stateIds)}
          ) AS "activeServiceProviders",
          (
            SELECT COUNT(*)::int FROM "ServiceProvider" sp
            WHERE sp."approvalStatus"::text = 'APPROVED'
              ${sqlStateIn(Prisma.sql`sp."stateId"`, stateIds)}
          ) AS "verifiedProviders",
          (
            SELECT COUNT(*)::int FROM "ServiceProvider" sp
            WHERE sp."isActive" = true
              AND sp."createdAt" >= ${since7}
              ${sqlStateIn(Prisma.sql`sp."stateId"`, stateIds)}
          ) AS "last7ActiveServiceProviders",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS listings,
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."isActive" = true
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "activeListings",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."approvalStatus"::text = 'APPROVED'
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "saleApproved",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."approvalStatus"::text = 'PENDING'
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "salePending",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."approvalStatus"::text = 'REJECTED'
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "saleRejected",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."createdAt" >= ${since7}
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "newSaleListings7d",
          (
            SELECT COUNT(*)::int FROM "MarketplaceProduct" p
            WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
              AND p."isActive" = true AND p."createdAt" >= ${since7}
              ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
          ) AS "last7ActiveListings",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e.status::text IN ('NEW', 'CONTACTED')
              ${sqlStateIn(Prisma.sql`e."stateId"`, stateIds)}
          ) AS "openEnquiries",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e.status::text = 'CLOSED'
              ${sqlStateIn(Prisma.sql`e."stateId"`, stateIds)}
          ) AS "closedEnquiries",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e."providerId" IS NULL
              ${sqlStateIn(Prisma.sql`e."stateId"`, stateIds)}
          ) AS "enquiryCentral",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e."providerId" IS NOT NULL
              ${sqlStateIn(Prisma.sql`e."stateId"`, stateIds)}
          ) AS "enquiryProvider",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e.kind::text = 'PROVIDER'
          ) AS "listEnquiries",
          (
            SELECT COUNT(*)::int FROM "Enquiry" e
            WHERE e."deletedAt" IS NULL AND e."adminFlag"::text <> 'DELETE'
              AND e.kind::text IN ('PRODUCT', 'USER')
          ) AS "productEnquiries",
          (
            SELECT COUNT(*)::int FROM "Suggestion" s
            WHERE s."deletedAt" IS NULL AND s."adminFlag"::text <> 'DELETE'
          ) AS "suggestionsTotal",
          (
            SELECT COUNT(*)::int FROM "Suggestion" s
            WHERE s."deletedAt" IS NULL AND s."adminFlag"::text <> 'DELETE'
              AND s.status::text IN ('OPEN', 'NEW', 'PENDING')
          ) AS "suggestionsOpen",
          (
            SELECT COUNT(*)::int FROM "Suggestion" s
            WHERE s."deletedAt" IS NULL AND s."adminFlag"::text <> 'DELETE'
              AND s.status::text IN ('CLOSED', 'RESOLVED', 'DONE')
          ) AS "suggestionsClosed",
          (SELECT COUNT(*)::int FROM "UserBroadcast") AS "pushNotifications",
          (SELECT COUNT(*)::int FROM "UserBroadcast" b WHERE b."readAt" IS NULL) AS "pushUnread",
          (
            SELECT COUNT(*)::int FROM "JobAlert" j
            WHERE j."isActive" = true AND j."deletedAt" IS NULL AND j."adminFlag"::text <> 'DELETE'
              AND (
                (j."startsAt" <= ${windowEnd} AND (j."endsAt" IS NULL OR j."endsAt" >= ${windowStart}))
                OR (j."startsAt" IS NULL AND j."endsAt" IS NULL)
              )
          ) AS "activeJobAlerts",
          (
            SELECT COUNT(*)::int FROM "Event" ev
            WHERE ev."isActive" = true AND ev."deletedAt" IS NULL AND ev."adminFlag"::text <> 'DELETE'
              AND ev."startsAt" <= ${windowEnd}
              AND (ev."endsAt" IS NULL OR ev."endsAt" >= ${windowStart})
          ) AS "activeEventsTotal",
          (
            SELECT COUNT(*)::int FROM "Payment" p
            LEFT JOIN "User" u ON u.id = p."userId"
            WHERE p.purpose::text = 'SPONSORSHIP' AND p.status::text = 'SUCCESS'
              ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
              AND (
                (p."validUntil" IS NOT NULL AND p."validUntil" >= ${now})
                OR (p."validUntil" IS NULL AND p."paidAt" IS NOT NULL AND p."paidAt" >= ${yearAgo})
              )
          ) AS "subscriptionActive",
          (
            SELECT COUNT(*)::int FROM "Payment" p
            LEFT JOIN "User" u ON u.id = p."userId"
            WHERE p.purpose::text = 'SPONSORSHIP' AND p.status::text = 'SUCCESS'
              ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
              AND NOT (
                (p."validUntil" IS NOT NULL AND p."validUntil" >= ${now})
                OR (p."validUntil" IS NULL AND p."paidAt" IS NOT NULL AND p."paidAt" >= ${yearAgo})
              )
          ) AS "subscriptionInactive",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                u."stateId",
                COALESCE(st.name, 'Unassigned') AS "stateName",
                COUNT(*) FILTER (WHERE r.name::text = 'END_USER')::int AS "endUserSubmitted",
                COUNT(*) FILTER (WHERE r.name::text = 'SERVICE_PROVIDER_ADMIN')::int AS "providerAdminSubmitted",
                COUNT(*) FILTER (WHERE r.name::text = 'END_USER' AND u."emailVerifiedAt" IS NOT NULL)::int AS "endUserVerified",
                COUNT(*) FILTER (WHERE r.name::text = 'SERVICE_PROVIDER_ADMIN' AND u."emailVerifiedAt" IS NOT NULL)::int AS "providerAdminVerified"
              FROM "User" u
              INNER JOIN "Role" r ON r.id = u."roleId"
              LEFT JOIN "State" st ON st.id = u."stateId"
              WHERE r.name::text IN ('END_USER', 'SERVICE_PROVIDER_ADMIN')
                ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
              GROUP BY u."stateId", st.name
              ORDER BY COALESCE(st.name, 'Unassigned')
            ) x
          ) AS "usersByState",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                u."stateId",
                COALESCE(st.name, 'Unassigned') AS "stateName",
                COUNT(*)::int AS count
              FROM "User" u
              INNER JOIN "Role" r ON r.id = u."roleId"
              LEFT JOIN "State" st ON st.id = u."stateId"
              WHERE r.name::text = 'VOLUNTEER'
                ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
              GROUP BY u."stateId", st.name
              ORDER BY COALESCE(st.name, 'Unassigned')
            ) x
          ) AS "volunteerByState",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                sp."stateId",
                COALESCE(st.name, 'Unknown') AS "stateName",
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE sp."approvalStatus"::text = 'APPROVED')::int AS verified,
                COUNT(*) FILTER (WHERE sp."approvalStatus"::text <> 'APPROVED')::int AS unverified
              FROM "ServiceProvider" sp
              LEFT JOIN "State" st ON st.id = sp."stateId"
              WHERE TRUE
              ${sqlStateIn(Prisma.sql`sp."stateId"`, stateIds)}
              GROUP BY sp."stateId", st.name
              ORDER BY COALESCE(st.name, 'Unknown')
            ) x
          ) AS "providersByState",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                p."stateId",
                COALESCE(st.name, 'Unassigned') AS "stateName",
                COUNT(*)::int AS count
              FROM "MarketplaceProduct" p
              LEFT JOIN "State" st ON st.id = p."stateId"
              WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
                ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
              GROUP BY p."stateId", st.name
            ) x
          ) AS "salesByState",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT s.status::text AS status, COUNT(*)::int AS count
              FROM "Suggestion" s
              WHERE s."deletedAt" IS NULL AND s."adminFlag"::text <> 'DELETE'
              GROUP BY s.status
            ) x
          ) AS "suggestionsByStatus",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT j.id, j.title, j."postDate", j."lastDate", j."startsAt", j."endsAt", j."createdAt"
              FROM "JobAlert" j
              WHERE j."isActive" = true AND j."deletedAt" IS NULL AND j."adminFlag"::text <> 'DELETE'
              ORDER BY j."createdAt" DESC
              LIMIT 5
            ) x
          ) AS "latestJobAlerts",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT COALESCE(ev.location, 'Unspecified') AS location, COUNT(*)::int AS count
              FROM "Event" ev
              WHERE ev."isActive" = true AND ev."deletedAt" IS NULL AND ev."adminFlag"::text <> 'DELETE'
                AND ev."startsAt" <= ${windowEnd}
                AND (ev."endsAt" IS NULL OR ev."endsAt" >= ${windowStart})
              GROUP BY ev.location
            ) x
          ) AS "eventsByLocation",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                p."approvalStatus"::text AS "approvalStatus",
                r.name::text AS "roleName",
                (u."emailVerifiedAt" IS NOT NULL) AS verified,
                COUNT(*)::int AS count
              FROM "MarketplaceProduct" p
              LEFT JOIN "User" u ON u.id = p."createdById"
              LEFT JOIN "Role" r ON r.id = u."roleId"
              WHERE p."deletedAt" IS NULL AND p."adminFlag"::text <> 'DELETE'
                ${sqlStateIn(Prisma.sql`p."stateId"`, stateIds)}
              GROUP BY p."approvalStatus", r.name, (u."emailVerifiedAt" IS NOT NULL)
            ) x
          ) AS "salesSubmitters",
          (
            SELECT COALESCE(json_agg(x), json_build_array()) FROM (
              SELECT
                pay."stateId",
                pay."stateName",
                pay."planId",
                pay.active,
                COUNT(*)::int AS count
              FROM (
                SELECT
                  u."stateId",
                  COALESCE(st.name, 'Unassigned') AS "stateName",
                  p."planId",
                  CASE
                    WHEN p."validUntil" IS NOT NULL AND p."validUntil" >= ${now} THEN true
                    WHEN p."validUntil" IS NULL AND p."paidAt" IS NOT NULL AND p."paidAt" >= ${yearAgo} THEN true
                    ELSE false
                  END AS active
                FROM "Payment" p
                LEFT JOIN "User" u ON u.id = p."userId"
                LEFT JOIN "State" st ON st.id = u."stateId"
                WHERE p.purpose::text = 'SPONSORSHIP' AND p.status::text = 'SUCCESS'
                  ${sqlStateIn(Prisma.sql`u."stateId"`, stateIds)}
              ) pay
              GROUP BY pay."stateId", pay."stateName", pay."planId", pay.active
              ORDER BY pay."stateName"
            ) x
          ) AS "subscriptionsByState"
      `.then((rows) => rows[0]),
      isCentralAdmin ? this.centralAdminExtras(now) : Promise.resolve(null),
    ]);

    if (!row) throw new Error('stats snapshot returned no row');

    const totalUsers = asNum(row.totalUsers);
    const activeUsers = asNum(row.activeUsers);
    const totalServiceProviders = asNum(row.totalServiceProviders);
    const activeServiceProviders = asNum(row.activeServiceProviders);
    const verifiedProviders = asNum(row.verifiedProviders);
    const openEnquiries = asNum(row.openEnquiries);
    const closedEnquiries = asNum(row.closedEnquiries);
    const newSaleListings7d = asNum(row.newSaleListings7d);
    const suggestionsTotal = asNum(row.suggestionsTotal);
    const pushNotifications = asNum(row.pushNotifications);
    const pushUnread = asNum(row.pushUnread);
    const activeJobAlerts = asNum(row.activeJobAlerts);
    const subscriptionActive = asNum(row.subscriptionActive);
    const subscriptionInactive = asNum(row.subscriptionInactive);
    const windowDays = Math.max(
      1,
      Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)),
    );

    const usersByState = asList<{
      stateId: string | null;
      stateName: string;
      endUserSubmitted: number;
      providerAdminSubmitted: number;
      endUserVerified: number;
      providerAdminVerified: number;
    }>(row.usersByState).map((item) => {
      const submitted = {
        endUser: asNum(item.endUserSubmitted),
        providerAdmin: asNum(item.providerAdminSubmitted),
      };
      const verified = {
        endUser: asNum(item.endUserVerified),
        providerAdmin: asNum(item.providerAdminVerified),
      };
      return {
        stateId: item.stateId,
        stateName: item.stateName || 'Unassigned',
        submitted,
        verified,
        unverified: {
          endUser: Math.max(0, submitted.endUser - verified.endUser),
          providerAdmin: Math.max(0, submitted.providerAdmin - verified.providerAdmin),
        },
      };
    });

    const emptySubmitters = (): SubmitterCounts => ({
      endUserVerified: 0,
      endUserUnverified: 0,
      providerAdminVerified: 0,
      providerAdminUnverified: 0,
      unknown: 0,
    });
    const salesBreakdown = {
      approved: emptySubmitters(),
      unapproved: emptySubmitters(),
    };
    for (const item of asList<{
      approvalStatus: string;
      roleName: string | null;
      verified: boolean;
      count: number;
    }>(row.salesSubmitters)) {
      const bucket =
        item.approvalStatus === MarketplaceApprovalStatus.APPROVED
          ? salesBreakdown.approved
          : salesBreakdown.unapproved;
      const count = asNum(item.count);
      if (item.roleName === RoleName.END_USER) {
        if (item.verified) bucket.endUserVerified += count;
        else bucket.endUserUnverified += count;
      } else if (item.roleName === RoleName.SERVICE_PROVIDER_ADMIN) {
        if (item.verified) bucket.providerAdminVerified += count;
        else bucket.providerAdminUnverified += count;
      } else {
        bucket.unknown += count;
      }
    }

    type TierCounts = { platinum: number; gold: number; silver: number; other: number };
    const emptyTiers = (): TierCounts => ({ platinum: 0, gold: 0, silver: 0, other: 0 });
    const subscriptionMap = new Map<
      string,
      { stateId: string | null; stateName: string; active: TierCounts; inactive: TierCounts }
    >();
    for (const item of asList<{
      stateId: string | null;
      stateName: string;
      planId: string | null;
      active: boolean;
      count: number;
    }>(row.subscriptionsByState)) {
      const key = item.stateId || '__unassigned__';
      let bucket = subscriptionMap.get(key);
      if (!bucket) {
        bucket = {
          stateId: item.stateId ?? null,
          stateName: item.stateName || 'Unassigned',
          active: emptyTiers(),
          inactive: emptyTiers(),
        };
        subscriptionMap.set(key, bucket);
      }
      const tier = normalizePlanCode(item.planId) as keyof TierCounts;
      (item.active ? bucket.active : bucket.inactive)[tier] += asNum(item.count);
    }

    const eventsByLocation = asList<{ location: string; count: number }>(row.eventsByLocation).map(
      (item) => ({
        location: item.location || 'Unspecified',
        count: asNum(item.count),
      }),
    );

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalServiceProviders,
      activeServiceProviders,
      inactiveServiceProviders: totalServiceProviders - activeServiceProviders,
      listings: asNum(row.listings),
      activeListings: asNum(row.activeListings),
      listEnquiries: asNum(row.listEnquiries),
      productEnquiries: asNum(row.productEnquiries),
      last7ActiveUsers: asNum(row.last7ActiveUsers),
      last7ActiveServiceProviders: asNum(row.last7ActiveServiceProviders),
      last7ActiveListings: asNum(row.last7ActiveListings),
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
        latestJobAlerts: asList(row.latestJobAlerts),
        subscriptionCount: subscriptionActive,
        inactiveSubscriptionCount: subscriptionInactive,
      },
      users: {
        byState: usersByState,
        volunteersByState: asList<{ stateId: string | null; stateName: string; count: number }>(
          row.volunteerByState,
        ).map((item) => ({
          stateId: item.stateId,
          stateName: item.stateName || 'Unassigned',
          count: asNum(item.count),
        })),
      },
      serviceProviders: {
        byState: asList<{
          stateId: string;
          stateName: string;
          total: number;
          verified: number;
          unverified: number;
        }>(row.providersByState).map((item) => ({
          stateId: item.stateId,
          stateName: item.stateName || 'Unknown',
          total: asNum(item.total),
          verified: asNum(item.verified),
          unverified: asNum(item.unverified),
        })),
        verified: verifiedProviders,
        unverified: totalServiceProviders - verifiedProviders,
      },
      sales: {
        byState: asList<{ stateId: string | null; stateName: string; count: number }>(
          row.salesByState,
        ).map((item) => ({
          stateId: item.stateId,
          stateName: item.stateName || 'Unassigned',
          count: asNum(item.count),
        })),
        approved: asNum(row.saleApproved),
        unapproved: asNum(row.salePending),
        rejected: asNum(row.saleRejected),
        last7Days: newSaleListings7d,
        bySubmitter: salesBreakdown,
      },
      enquiries: {
        centralAdmin: asNum(row.enquiryCentral),
        providerAdmin: asNum(row.enquiryProvider),
        open: openEnquiries,
        closed: closedEnquiries,
      },
      suggestions: {
        total: suggestionsTotal,
        open: asNum(row.suggestionsOpen),
        closed: asNum(row.suggestionsClosed),
        byStatus: asList<{ status: string; count: number }>(row.suggestionsByStatus).map((item) => ({
          status: item.status,
          count: asNum(item.count),
        })),
      },
      jobAlerts: {
        activeInWindow: activeJobAlerts,
        windowDays,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        latest: asList(row.latestJobAlerts),
      },
      events: {
        windowDays,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        byLocation: eventsByLocation,
        total: asNum(row.activeEventsTotal),
      },
      subscriptions: {
        activeCount: subscriptionActive,
        inactiveCount: subscriptionInactive,
        byState: [...subscriptionMap.values()],
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

  private async centralAdminExtras(now: Date) {
    const extras = await runPool(
      [
        () =>
          this.prisma.user.findMany({
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
          }),
        () =>
          this.prisma.payment.count({
            where: {
              purpose: 'SPONSORSHIP',
              status: 'SUCCESS',
              OR: [{ validUntil: { gte: now } }, { validUntil: null, paidAt: { gte: addDays(now, -365) } }],
            },
          }),
        () =>
          this.prisma.payment.count({
            where: {
              purpose: 'SPONSORSHIP',
              status: 'SUCCESS',
              validUntil: { lt: now },
            },
          }),
        () =>
          this.prisma.payment.findMany({
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
          }),
      ],
      2,
    );

    const stateAdmins = extras[0] as Array<{
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      isActive: boolean;
      state: { id: string; name: string; code: string | null } | null;
      sessions: Array<{
        id: string;
        createdAt: Date;
        revokedAt: Date | null;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
      }>;
    }>;
    const activeSponsors = extras[1] as number;
    const invalidSponsors = extras[2] as number;
    const recentSponsors = extras[3] as Array<{
      id: string;
      payerName: string | null;
      payerEmail: string | null;
      amount: { toString(): string } | number;
      planId: string | null;
      paidAt: Date | null;
      validUntil: Date | null;
      status: string;
    }>;

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
          isValid: p.validUntil
            ? p.validUntil >= now
            : Boolean(p.paidAt && p.paidAt >= addDays(now, -365)),
        })),
      },
    };
  }
}
