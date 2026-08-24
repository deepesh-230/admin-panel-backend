import { PrismaService } from '../prisma/prisma.service';
export type CmsModel = 'faq' | 'usefulLink' | 'helpTicket' | 'cmsPage' | 'blog' | 'jobAlert' | 'suggestion' | 'volunteer' | 'marketplaceProduct' | 'marketplaceParty';
export declare class CmsService {
    private prisma;
    constructor(prisma: PrismaService);
    private client;
    findAll(model: CmsModel, search?: string, searchFields?: string[], extraWhere?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
    findOne(model: CmsModel, id: string): Promise<Record<string, unknown>>;
    create(model: CmsModel, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(model: CmsModel, id: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(model: CmsModel, id: string): Promise<Record<string, unknown>>;
    broadcastLink(id: string): Promise<Record<string, unknown>>;
}
