import { CmsService } from './cms.service';
declare const FaqsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class FaqsController extends FaqsController_base {
}
export declare class UsefulLinksController {
    private readonly cms;
    constructor(cms: CmsService);
    findAll(search?: string): Promise<Record<string, unknown>[]>;
    findOne(id: string): Promise<Record<string, unknown>>;
    create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
    broadcast(id: string): Promise<Record<string, unknown>>;
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
declare const JobAlertsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class JobAlertsController extends JobAlertsController_base {
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
declare const MarketplaceProductsController_base: {
    new (cms: CmsService): {
        readonly cms: CmsService;
        findAll(search?: string, kind?: string): Promise<Record<string, unknown>[]>;
        findOne(id: string): Promise<Record<string, unknown>>;
        create(body: Record<string, unknown>): Promise<Record<string, unknown>>;
        update(id: string, body: Record<string, unknown>): Promise<Record<string, unknown>>;
        remove(id: string): Promise<Record<string, unknown>>;
    };
};
export declare class MarketplaceProductsController extends MarketplaceProductsController_base {
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
