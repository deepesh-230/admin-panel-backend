import { CmsService } from './cms.service';
import { BroadcastsService } from './broadcasts.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
export declare class FaqsController {
    private readonly cms;
    constructor(cms: CmsService);
    findAll(search?: string): Promise<Record<string, unknown>[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
export declare class UsefulLinksController {
    private readonly cms;
    private readonly broadcasts;
    constructor(cms: CmsService, broadcasts: BroadcastsService);
    findAll(search?: string): Promise<Record<string, unknown>[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    broadcast(id: string): Promise<{
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
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
declare const HelpTicketsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class HelpTicketsController extends HelpTicketsController_base {
}
declare const CmsPagesController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class CmsPagesController extends CmsPagesController_base {
}
declare const BlogsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class BlogsController extends BlogsController_base {
}
export declare class JobAlertsController {
    private readonly cms;
    private readonly broadcasts;
    constructor(cms: CmsService, broadcasts: BroadcastsService);
    findAll(search?: string): Promise<Record<string, unknown>[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    broadcast(id: string): Promise<{
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
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
declare const SuggestionsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class SuggestionsController extends SuggestionsController_base {
}
declare const VolunteersController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class VolunteersController extends VolunteersController_base {
}
export declare class MarketplaceProductsController {
    private readonly marketplace;
    constructor(marketplace: MarketplaceService);
    findAll(search?: string, listingIntent?: string): import("@prisma/client").Prisma.PrismaPromise<({
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        address: string | null;
        gallery: string[];
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    })[]>;
    findOne(id: string): Promise<{
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        address: string | null;
        gallery: string[];
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    }>;
    create(body: Record<string, unknown>): import("@prisma/client").Prisma.Prisma__MarketplaceProductClient<{
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        address: string | null;
        gallery: string[];
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: Record<string, unknown>): Promise<{
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        address: string | null;
        gallery: string[];
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        address: string | null;
        gallery: string[];
        createdById: string | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
    }>;
}
declare const MarketplacePartiesController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class MarketplacePartiesController extends MarketplacePartiesController_base {
}
export {};
