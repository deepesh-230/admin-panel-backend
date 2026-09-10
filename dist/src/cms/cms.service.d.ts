import { PrismaService } from '../prisma/prisma.service';
export type CmsModel = 'faq' | 'usefulLink' | 'socialSetting' | 'helpTicket' | 'cmsPage' | 'blog' | 'homeBanner' | 'jobAlert' | 'suggestion' | 'volunteer' | 'marketplaceProduct' | 'marketplaceParty';
export declare class CmsService {
    private prisma;
    constructor(prisma: PrismaService);
    private client;
    findAll(model: CmsModel, search?: string, searchFields?: string[], extraWhere?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
    findJobAlerts(filters: {
        search?: string;
        isActive?: boolean;
        postFrom?: string;
        postTo?: string;
        closeFrom?: string;
        closeTo?: string;
    }): Promise<{
        description: string | null;
        id: string;
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
    }[]>;
    findOne(model: CmsModel, id: string): Promise<Record<string, unknown>>;
    create(model: CmsModel, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(model: CmsModel, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(model: CmsModel, id: string): Promise<Record<string, unknown>>;
}
