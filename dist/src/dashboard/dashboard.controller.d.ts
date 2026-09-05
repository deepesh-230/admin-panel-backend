import { AdminLifecycleFlag } from '@prisma/client';
import { type AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';
declare class SetFlagDto {
    entity: 'enquiry' | 'suggestion' | 'jobAlert' | 'event' | 'marketplaceProduct';
    id: string;
    flag: AdminLifecycleFlag;
}
declare class CreateEventDto {
    title: string;
    description?: string;
    location?: string;
    startsAt: string;
    endsAt?: string;
    isActive?: boolean;
}
declare class UpdateEventDto {
    title?: string;
    description?: string;
    location?: string;
    startsAt?: string;
    endsAt?: string | null;
    isActive?: boolean;
    adminFlag?: AdminLifecycleFlag;
}
export declare class DashboardController {
    private readonly dashboardService;
    private readonly prisma;
    constructor(dashboardService: DashboardService, prisma: PrismaService);
    getStats(user: AuthUser, from?: string, to?: string): Promise<{
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
    purgeDeleted(): Promise<{
        purged: {
            enquiries: number;
            suggestions: number;
            jobAlerts: number;
            events: number;
            marketplaceProducts: number;
        };
        cutoff: string;
    }>;
    backfill(): Promise<{
        verifiedUsers: number;
        approvedSales: number;
        sponsorValiditySet: number;
        noopSponsorUpdateMany: number;
    }>;
    setFlag(dto: SetFlagDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        phone: string | null;
        stateId: string | null;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
        status: import("@prisma/client").$Enums.EnquiryStatus;
        providerId: string | null;
        message: string | null;
        marketplaceProductId: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    } | {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        postDate: string | null;
        lastDate: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
        broadcastAt: Date | null;
    } | {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        status: string;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        receivedFrom: string | null;
    } | {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        stateId: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        address: string | null;
        gallery: string[];
        approvalStatus: import("@prisma/client").$Enums.MarketplaceApprovalStatus;
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    } | {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        location: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        startsAt: Date;
        endsAt: Date | null;
    } | {
        ok: boolean;
    }>;
    listEvents(from?: string, to?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        location: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        startsAt: Date;
        endsAt: Date | null;
    }[]>;
    createEvent(dto: CreateEventDto): import("@prisma/client").Prisma.Prisma__EventClient<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        location: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        startsAt: Date;
        endsAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateEvent(id: string, dto: UpdateEventDto): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        location: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        title: string;
        startsAt: Date;
        endsAt: Date | null;
    }>;
    removeEvent(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
export {};
