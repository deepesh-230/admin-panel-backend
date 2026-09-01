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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        url: string;
    }>;
    broadcastJobAlert(id: string): Promise<{
        recipientCount: number;
        broadcastAt: Date;
        message: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string;
        postDate: string | null;
        lastDate: string | null;
    }>;
    listForUser(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        url: string | null;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }[]>;
    markRead(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        url: string | null;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }>;
}
