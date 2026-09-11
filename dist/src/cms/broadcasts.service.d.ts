import { PrismaService } from '../prisma/prisma.service';
export type BroadcastResult = {
    recipientCount: number;
    broadcastAt: Date;
    message: string;
};
export declare class BroadcastsService {
    private prisma;
    constructor(prisma: PrismaService);
    private notifyEndUsers;
    broadcastUsefulLink(id: string): Promise<{
        recipientCount: number;
        broadcastAt: Date;
        message: string;
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
    }>;
    broadcastJobAlert(id: string): Promise<{
        recipientCount: number;
        broadcastAt: Date;
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        description: string | null;
        postDate: string | null;
        lastDate: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
    listForUser(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        url: string | null;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }[]>;
    markRead(userId: string, id: string): Promise<{
        url: string | null;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }>;
}
