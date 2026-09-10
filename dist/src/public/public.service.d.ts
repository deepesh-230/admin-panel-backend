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
        id: string;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string | null;
    })[]>;
    listSubcategories(categoryId: string): Promise<{
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string | null;
        categoryId: string;
    }[]>;
    listStates(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string | null;
    }[]>;
    listFaqs(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            id: string;
            name: string;
            code: string | null;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        image: string;
        url: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageStateId: string | null;
        coverageCity: string | null;
    })[]>;
    listBlogs(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            id: string;
            name: string;
            code: string | null;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        image: string;
        url: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageStateId: string | null;
        coverageCity: string | null;
    })[]>;
    listHomeBanners(viewer?: {
        stateId?: string;
        city?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        sortOrder: number;
        title: string | null;
        image: string;
        url: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageStateId: string | null;
        coverageCity: string | null;
    }[]>;
    listJobAlerts(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
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
            id: string;
            name: string;
            code: string | null;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        image: string;
        url: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageStateId: string | null;
        coverageCity: string | null;
    })[]>;
    listSocialSettings(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            id: string;
            name: string;
            code: string | null;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        image: string;
        url: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageStateId: string | null;
        coverageCity: string | null;
    })[]>;
    getPageBySlug(slug: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        location: string | null;
        stateId: string | null;
        description: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        address: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
        gallery: string[];
        createdById: string | null;
        approvalStatus: import("@prisma/client").$Enums.MarketplaceApprovalStatus;
    }[]>;
    getMarketplaceProduct(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        location: string | null;
        stateId: string | null;
        description: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        actualPrice: string | null;
        offerPrice: string | null;
        listingIntent: string;
        sellerName: string | null;
        address: string | null;
        color: string | null;
        brand: string | null;
        features: string | null;
        gallery: string[];
        createdById: string | null;
        approvalStatus: import("@prisma/client").$Enums.MarketplaceApprovalStatus;
    }>;
    createEnquiry(dto: CreatePublicEnquiryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        status: import("@prisma/client").$Enums.EnquiryStatus;
        email: string;
        phone: string | null;
        stateId: string | null;
        category: string;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
        createdBy: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        kind: string;
        providerId: string | null;
        message: string | null;
        marketplaceProductId: string | null;
    }>;
    createHelpTicket(dto: CreatePublicHelpTicketDto): import("@prisma/client").Prisma.Prisma__HelpTicketClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: string;
        email: string;
        phone: string | null;
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
            applicationId: string;
            questionId: string | null;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            answerText: string;
            selectedOption: string | null;
        }[];
    } & {
        id: string;
        target: import("@prisma/client").$Enums.BecomeTarget;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        email: string;
        phone: string | null;
        adminNote: string | null;
    }>;
    listMyBecomeApplications(params: {
        userId?: string;
        email?: string;
    }): Promise<{
        applications: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            createdAt: Date;
            updatedAt: Date;
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
