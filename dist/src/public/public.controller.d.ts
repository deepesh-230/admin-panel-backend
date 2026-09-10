import { BecomeTarget, CategoryType } from '@prisma/client';
import { CreateBecomeApplicationDto } from '../become/dto/become.dto';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { CreatePublicHelpTicketDto } from './dto/create-public-help-ticket.dto';
import { PublicService } from './public.service';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    listCategories(type?: CategoryType): Promise<({
        _count: {
            subcategories: number;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    })[]>;
    listSubcategories(categoryId: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }[]>;
    listStates(): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }[]>;
    listFaqs(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            code: string | null;
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        image: string;
        title: string | null;
        url: string | null;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    listBlogs(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            code: string | null;
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        image: string;
        title: string | null;
        url: string | null;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    listHomeBanners(stateId?: string, city?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        sortOrder: number;
        image: string;
        title: string | null;
        url: string | null;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    }[]>;
    listJobAlerts(): Promise<{
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
            code: string | null;
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        image: string;
        title: string | null;
        url: string | null;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    listSocialSettings(): Promise<Record<string, unknown>[] | ({
        coverageState: {
            code: string | null;
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        image: string;
        title: string | null;
        url: string | null;
        coverageStateId: string | null;
        coverageFlag: import("@prisma/client").$Enums.CoverageFlag;
        coverageCity: string | null;
    })[]>;
    listBecomeQuestions(target?: string): Promise<{
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
    listMyBecomeApplications(userId?: string, email?: string): Promise<{
        applications: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
            target: import("@prisma/client").$Enums.BecomeTarget;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        phone: string | null;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        target: import("@prisma/client").$Enums.BecomeTarget;
        adminNote: string | null;
    }>;
    getPage(slug: string): Promise<{
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
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        stateId: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
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
    }[]>;
    getMarketplaceProduct(id: string): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
        location: string | null;
        stateId: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
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
    }>;
    createEnquiry(dto: CreatePublicEnquiryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        phone: string | null;
        stateId: string | null;
        category: string;
        sNo: number;
        subCategory: string;
        product: string;
        date: string;
        createdBy: string;
        kind: string;
        status: import("@prisma/client").$Enums.EnquiryStatus;
        providerId: string | null;
        message: string | null;
        marketplaceProductId: string | null;
        adminFlag: import("@prisma/client").$Enums.AdminLifecycleFlag;
        deletedAt: Date | null;
    }>;
    createHelpTicket(dto: CreatePublicHelpTicketDto): import("@prisma/client").Prisma.Prisma__HelpTicketClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        phone: string | null;
        status: string;
        message: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
