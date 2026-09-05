import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    purgeDeleted(olderThanDays?: number): Promise<{
        purged: {
            enquiries: number;
            suggestions: number;
            jobAlerts: number;
            events: number;
            marketplaceProducts: number;
        };
        cutoff: string;
    }>;
    getStats(currentUser: AuthUser, range?: {
        from?: string;
        to?: string;
    }): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        totalServiceProviders: number;
        activeServiceProviders: number;
        inactiveServiceProviders: number;
        listings: number;
        activeListings: number;
        listEnquiries: number;
        productEnquiries: number;
        last7ActiveUsers: number;
        last7ActiveServiceProviders: number;
        last7ActiveListings: number;
        overview: {
            activeUsers: number;
            serviceProviders: number;
            enquiries: number;
            openEnquiries: number;
            closedEnquiries: number;
            newSaleListingsLast7Days: number;
            suggestions: number;
            pushNotifications: number;
            pushUnread: number;
            activeJobAlerts: number;
            latestJobAlerts: {
                id: string;
                createdAt: Date;
                title: string;
                postDate: string | null;
                lastDate: string | null;
                startsAt: Date | null;
                endsAt: Date | null;
            }[];
        };
        users: {
            byState: {
                stateId: string | null;
                stateName: string;
                submitted: {
                    endUser: number;
                    providerAdmin: number;
                };
                verified: {
                    endUser: number;
                    providerAdmin: number;
                };
                unverified: {
                    endUser: number;
                    providerAdmin: number;
                };
            }[];
            volunteersByState: {
                stateId: string | null;
                stateName: string;
                count: number;
            }[];
        };
        serviceProviders: {
            byState: {
                stateId: string;
                stateName: string;
                total: number;
                verified: number;
                unverified: number;
            }[];
            verified: number;
            unverified: number;
        };
        sales: {
            byState: {
                stateId: string | null;
                stateName: string;
                count: number;
            }[];
            approved: number;
            unapproved: number;
            rejected: number;
            last7Days: number;
            bySubmitter: {
                approved: {
                    endUserVerified: number;
                    endUserUnverified: number;
                    providerAdminVerified: number;
                    providerAdminUnverified: number;
                    unknown: number;
                };
                unapproved: {
                    endUserVerified: number;
                    endUserUnverified: number;
                    providerAdminVerified: number;
                    providerAdminUnverified: number;
                    unknown: number;
                };
            };
        };
        enquiries: {
            centralAdmin: number;
            providerAdmin: number;
            open: number;
            closed: number;
        };
        suggestions: {
            total: number;
            open: number;
            closed: number;
            byStatus: {
                status: string;
                count: number;
            }[];
        };
        jobAlerts: {
            activeInWindow: number;
            windowDays: number;
            windowStart: string;
            windowEnd: string;
            latest: {
                id: string;
                createdAt: Date;
                title: string;
                postDate: string | null;
                lastDate: string | null;
                startsAt: Date | null;
                endsAt: Date | null;
            }[];
        };
        events: {
            windowDays: number;
            windowStart: string;
            windowEnd: string;
            byLocation: {
                location: string;
                count: number;
            }[];
            total: number;
        };
        centralAdmin: {
            stateAdmins: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                state: {
                    id: string;
                    code: string | null;
                    name: string;
                } | null;
                sessions: {
                    id: string;
                    loginAt: Date;
                    logoutAt: Date | null;
                    expiresAt: Date;
                    ipAddress: string | null;
                    userAgent: string | null;
                    isActive: boolean;
                }[];
            }[];
            sponsors: {
                activeCount: number;
                invalidCount: number;
                recent: {
                    amount: number;
                    isValid: boolean;
                    id: string;
                    status: import("@prisma/client").$Enums.PaymentStatus;
                    payerName: string | null;
                    payerEmail: string | null;
                    planId: string | null;
                    paidAt: Date | null;
                    validUntil: Date | null;
                }[];
            };
        } | null;
    }>;
    backfill(): Promise<{
        verifiedUsers: number;
        approvedSales: number;
        sponsorValiditySet: number;
        noopSponsorUpdateMany: number;
    }>;
    private groupUsersByState;
    private groupVolunteersByState;
    private groupProvidersByState;
    private groupSalesByState;
    private salesSubmitterBreakdown;
    private suggestionsByStatus;
    private centralAdminExtras;
}
