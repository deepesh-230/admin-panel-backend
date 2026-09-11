import { ConfigService } from '@nestjs/config';
import { BecomeTarget, CategoryType } from '@prisma/client';
import { BecomeService } from '../become/become.service';
import { CreateBecomeApplicationDto } from '../become/dto/become.dto';
import { CategoriesService } from '../categories/categories.service';
import { CmsService } from '../cms/cms.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { PaymentPlansService } from '../payments/payment-plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { StatesService } from '../states/states.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { CreatePublicHelpTicketDto } from './dto/create-public-help-ticket.dto';
export declare class PublicService {
    private categories;
    private states;
    private cms;
    private marketplace;
    private prisma;
    private config;
    private systemSettings;
    private paymentPlans;
    private become;
    constructor(categories: CategoriesService, states: StatesService, cms: CmsService, marketplace: MarketplaceService, prisma: PrismaService, config: ConfigService, systemSettings: SystemSettingsService, paymentPlans: PaymentPlansService, become: BecomeService);
    listCategories(type?: CategoryType): Promise<({
        _count: {
            subcategories: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    })[]>;
    listSubcategories(categoryId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string | null;
        description: string | null;
        sortOrder: number;
        categoryId: string;
    }[]>;
    listStates(): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    listFaqs(): Promise<Record<string, unknown>[] | ({
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
    listBlogs(): Promise<Record<string, unknown>[] | ({
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
    listHomeBanners(viewer?: {
        stateId?: string;
        city?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<{
        url: string | null;
        id: string;
        title: string | null;
        sortOrder: number;
        image: string;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    }[]>;
    listJobAlerts(): Promise<{
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
    listPaymentPlans(): Promise<{
        headerText: string;
        plans: {
            amount: number;
            id: string;
            code: string;
            name: string;
            currency: string;
            description: string | null;
            durationValue: number;
            durationUnit: import("@prisma/client").PaymentPlanDurationUnit;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    listUsefulLinks(): Promise<Record<string, unknown>[] | ({
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
    listSocialSettings(): Promise<Record<string, unknown>[] | ({
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
    getPageBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        slug: string;
        title: string;
        content: string;
    }>;
    getContact(): {
        address: string;
        phone: string;
        email: string;
        logo: string;
    };
    listMarketplaceProducts(search?: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    getMarketplaceProduct(id: string): Promise<{
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
    createEnquiry(dto: CreatePublicEnquiryDto): Promise<{
        name: string | null;
        date: string;
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        stateId: string | null;
        status: import("@prisma/client").$Enums.EnquiryStatus;
        createdBy: string;
        product: string;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        message: string | null;
        kind: string;
        providerId: string | null;
        sNo: number;
        subCategory: string;
        marketplaceProductId: string | null;
    }>;
    createHelpTicket(dto: CreatePublicHelpTicketDto): import("@prisma/client").Prisma.Prisma__HelpTicketClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        status: string;
        message: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listBecomeQuestions(target: BecomeTarget): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: import("@prisma/client").BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    submitBecomeApplication(dto: CreateBecomeApplicationDto): Promise<{
        answers: {
            id: string;
            createdAt: Date;
            questionId: string | null;
            answerText: string;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            selectedOption: string | null;
            applicationId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        userId: string | null;
        target: import("@prisma/client").$Enums.BecomeTarget;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        adminNote: string | null;
    }>;
    listMyBecomeApplications(params: {
        userId?: string;
        email?: string;
    }): Promise<{
        applications: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            target: import("@prisma/client").$Enums.BecomeTarget;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        }[];
        pending: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        } | null;
        latest: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        } | null;
        approvedTargets: import("@prisma/client").$Enums.BecomeTarget[];
        isVolunteer: boolean;
        menuDisabled: boolean;
        allowedTargets: import("@prisma/client").$Enums.BecomeTarget[];
    }>;
}
