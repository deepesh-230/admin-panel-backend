import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
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
    }>;
}
