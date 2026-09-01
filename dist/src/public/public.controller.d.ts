import { CategoryType } from '@prisma/client';
import { CreatePublicEnquiryDto } from './dto/create-public-enquiry.dto';
import { PublicService } from './public.service';
export declare class PublicController {
    private readonly publicService;
    constructor(publicService: PublicService);
    listCategories(type?: CategoryType): Promise<({
        _count: {
            subcategories: number;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        type: import("@prisma/client").$Enums.CategoryType;
        sortOrder: number;
    })[]>;
    listSubcategories(categoryId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string | null;
        sortOrder: number;
        categoryId: string;
    }[]>;
    listStates(): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }[]>;
    listFaqs(): Promise<Record<string, unknown>[]>;
    listBlogs(): Promise<Record<string, unknown>[]>;
    listJobAlerts(): Promise<Record<string, unknown>[]>;
    listUsefulLinks(): Promise<Record<string, unknown>[]>;
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
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
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
        location: string | null;
    }[]>;
    getMarketplaceProduct(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        phone: string | null;
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
        location: string | null;
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
    }>;
}
