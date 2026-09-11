import { CmsService } from './cms.service';
import { BroadcastsService } from './broadcasts.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
export declare class FaqsController {
    private readonly cms;
    constructor(cms: CmsService);
    findAll(search?: string): Promise<Record<string, unknown>[] | ({
        coverageState: {
            name: string;
            id: string;
            code: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
export declare class UsefulLinksController {
    private readonly cms;
    private readonly broadcasts;
    constructor(cms: CmsService, broadcasts: BroadcastsService);
    findAll(search?: string): Promise<Record<string, unknown>[] | ({
        coverageState: {
            name: string;
            id: string;
            code: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    broadcast(id: string): Promise<{
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
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
declare const SocialSettingsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class SocialSettingsController extends SocialSettingsController_base {
}
declare const HelpTicketsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
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
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
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
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class BlogsController extends BlogsController_base {
}
export declare class HomeBannersController {
    private readonly cms;
    constructor(cms: CmsService);
    findAll(search?: string, coverageFlag?: string): Promise<Record<string, unknown>[] | ({
        coverageState: {
            name: string;
            id: string;
            code: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<{
        coverageState: {
            name: string;
            id: string;
            code: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<{
        coverageState: {
            name: string;
            id: string;
            code: string | null;
        } | null;
    } & {
        url: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    }>;
    remove(id: string): Promise<Record<string, unknown>>;
}
export declare class JobAlertsController {
    private readonly cms;
    private readonly broadcasts;
    constructor(cms: CmsService, broadcasts: BroadcastsService);
    findAll(search?: string, isActive?: string, postFrom?: string, postTo?: string, closeFrom?: string, closeTo?: string): Promise<{
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
        broadcastAt: Date | null;
    }[]>;
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
        description: string | null;
        postDate: string | null;
        lastDate: string | null;
        startsAt: Date | null;
        endsAt: Date | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
    remove(id: string): Promise<Record<string, unknown>>;
}
declare const SuggestionsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
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
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
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
            name: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        description: string | null;
        stateId: string | null;
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
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        description: string | null;
        stateId: string | null;
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
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
    create(body: Record<string, unknown>): import("@prisma/client").Prisma.Prisma__MarketplaceProductClient<{
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        description: string | null;
        stateId: string | null;
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
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: Record<string, unknown>): Promise<{
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        description: string | null;
        stateId: string | null;
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
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        description: string | null;
        stateId: string | null;
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
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
}
declare const MarketplacePartiesController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[] | ({
            coverageState: {
                name: string;
                id: string;
                code: string | null;
            } | null;
        } & {
            url: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            title: string | null;
            sortOrder: number;
            image: string;
            coverageStateId: string | null;
            coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
            coverageCity: string | null;
        })[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class MarketplacePartiesController extends MarketplacePartiesController_base {
}
export {};
