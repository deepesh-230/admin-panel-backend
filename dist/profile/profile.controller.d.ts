import { type AuthUser } from '../common/decorators/current-user.decorator';
import { BroadcastsService } from '../cms/broadcasts.service';
import { CreateMarketplaceProductDto } from './dto/create-marketplace-product.dto';
import { CreateMyServiceProviderDto, UpdateMyServiceProviderDto } from './dto/my-service-provider.dto';
import { SubmitBusinessVerificationDto } from './dto/submit-business-verification.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { ServiceProvidersService } from '../service-providers/service-providers.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProfileController {
    private readonly marketplace;
    private readonly serviceProviders;
    private readonly prisma;
    private readonly broadcasts;
    constructor(marketplace: MarketplaceService, serviceProviders: ServiceProvidersService, prisma: PrismaService, broadcasts: BroadcastsService);
    updateProfile(user: AuthUser, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: {
            name: string | null;
            id: string;
            isActive: boolean;
            email: string;
            phone: string | null;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            pincode: string | null;
            km: number | null;
            digipin: string | null;
        };
    }>;
    myMarketplaceProducts(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
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
    createMarketplaceProduct(user: AuthUser, dto: CreateMarketplaceProductDto): Promise<{
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
    myServiceProviders(user: AuthUser): Promise<{
        id: string;
        name: string;
        categoryId: string;
        subcategoryId: string | null;
        description: string | null;
        phone: string | null;
        landline: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        stateId: string;
        latitude: number | null;
        longitude: number | null;
        googlePlaceId: string | null;
        about: string | null;
        services: string | null;
        coverPhotoUrl: string | null;
        gallery: string[];
        isActive: boolean;
        approvalStatus: import("@prisma/client").$Enums.ProviderApprovalStatus;
        rejectedReason: string | null;
        businessVerificationStatus: import("@prisma/client").$Enums.BusinessVerificationStatus;
        mcaId: string | null;
        din: string | null;
        gstin: string | null;
        nmcId: string | null;
        panId: string | null;
        verificationSubmittedAt: Date | null;
        verificationNote: string | null;
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            name: string;
            id: string;
        };
        subcategory: {
            name: string;
            id: string;
            categoryId: string;
        } | null;
        state: {
            name: string;
            id: string;
            code: string | null;
        };
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        approvedBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        admins: {
            id: string;
            userId: string;
            isPrimary: boolean;
            user: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                role: import("@prisma/client").$Enums.RoleName;
            };
            createdAt: Date;
        }[];
        adminCount: number;
        distanceKm: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    myServiceProvider(user: AuthUser, id: string): Promise<{
        id: string;
        name: string;
        categoryId: string;
        subcategoryId: string | null;
        description: string | null;
        phone: string | null;
        landline: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        stateId: string;
        latitude: number | null;
        longitude: number | null;
        googlePlaceId: string | null;
        about: string | null;
        services: string | null;
        coverPhotoUrl: string | null;
        gallery: string[];
        isActive: boolean;
        approvalStatus: import("@prisma/client").$Enums.ProviderApprovalStatus;
        rejectedReason: string | null;
        businessVerificationStatus: import("@prisma/client").$Enums.BusinessVerificationStatus;
        mcaId: string | null;
        din: string | null;
        gstin: string | null;
        nmcId: string | null;
        panId: string | null;
        verificationSubmittedAt: Date | null;
        verificationNote: string | null;
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            name: string;
            id: string;
        };
        subcategory: {
            name: string;
            id: string;
            categoryId: string;
        } | null;
        state: {
            name: string;
            id: string;
            code: string | null;
        };
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        approvedBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        admins: {
            id: string;
            userId: string;
            isPrimary: boolean;
            user: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                role: import("@prisma/client").$Enums.RoleName;
            };
            createdAt: Date;
        }[];
        adminCount: number;
        distanceKm: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createMyServiceProvider(user: AuthUser, dto: CreateMyServiceProviderDto): Promise<{
        id: string;
        name: string;
        categoryId: string;
        subcategoryId: string | null;
        description: string | null;
        phone: string | null;
        landline: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        stateId: string;
        latitude: number | null;
        longitude: number | null;
        googlePlaceId: string | null;
        about: string | null;
        services: string | null;
        coverPhotoUrl: string | null;
        gallery: string[];
        isActive: boolean;
        approvalStatus: import("@prisma/client").$Enums.ProviderApprovalStatus;
        rejectedReason: string | null;
        businessVerificationStatus: import("@prisma/client").$Enums.BusinessVerificationStatus;
        mcaId: string | null;
        din: string | null;
        gstin: string | null;
        nmcId: string | null;
        panId: string | null;
        verificationSubmittedAt: Date | null;
        verificationNote: string | null;
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            name: string;
            id: string;
        };
        subcategory: {
            name: string;
            id: string;
            categoryId: string;
        } | null;
        state: {
            name: string;
            id: string;
            code: string | null;
        };
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        approvedBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        admins: {
            id: string;
            userId: string;
            isPrimary: boolean;
            user: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                role: import("@prisma/client").$Enums.RoleName;
            };
            createdAt: Date;
        }[];
        adminCount: number;
        distanceKm: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMyServiceProvider(user: AuthUser, id: string, dto: UpdateMyServiceProviderDto): Promise<{
        id: string;
        name: string;
        categoryId: string;
        subcategoryId: string | null;
        description: string | null;
        phone: string | null;
        landline: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        stateId: string;
        latitude: number | null;
        longitude: number | null;
        googlePlaceId: string | null;
        about: string | null;
        services: string | null;
        coverPhotoUrl: string | null;
        gallery: string[];
        isActive: boolean;
        approvalStatus: import("@prisma/client").$Enums.ProviderApprovalStatus;
        rejectedReason: string | null;
        businessVerificationStatus: import("@prisma/client").$Enums.BusinessVerificationStatus;
        mcaId: string | null;
        din: string | null;
        gstin: string | null;
        nmcId: string | null;
        panId: string | null;
        verificationSubmittedAt: Date | null;
        verificationNote: string | null;
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            name: string;
            id: string;
        };
        subcategory: {
            name: string;
            id: string;
            categoryId: string;
        } | null;
        state: {
            name: string;
            id: string;
            code: string | null;
        };
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        approvedBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        admins: {
            id: string;
            userId: string;
            isPrimary: boolean;
            user: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                role: import("@prisma/client").$Enums.RoleName;
            };
            createdAt: Date;
        }[];
        adminCount: number;
        distanceKm: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeMyServiceProvider(user: AuthUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    submitBusinessVerification(user: AuthUser, id: string, dto: SubmitBusinessVerificationDto): Promise<{
        id: string;
        name: string;
        categoryId: string;
        subcategoryId: string | null;
        description: string | null;
        phone: string | null;
        landline: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        stateId: string;
        latitude: number | null;
        longitude: number | null;
        googlePlaceId: string | null;
        about: string | null;
        services: string | null;
        coverPhotoUrl: string | null;
        gallery: string[];
        isActive: boolean;
        approvalStatus: import("@prisma/client").$Enums.ProviderApprovalStatus;
        rejectedReason: string | null;
        businessVerificationStatus: import("@prisma/client").$Enums.BusinessVerificationStatus;
        mcaId: string | null;
        din: string | null;
        gstin: string | null;
        nmcId: string | null;
        panId: string | null;
        verificationSubmittedAt: Date | null;
        verificationNote: string | null;
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            name: string;
            id: string;
        };
        subcategory: {
            name: string;
            id: string;
            categoryId: string;
        } | null;
        state: {
            name: string;
            id: string;
            code: string | null;
        };
        createdBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        approvedBy: {
            name: string | null;
            id: string;
            email: string;
        } | null;
        admins: {
            id: string;
            userId: string;
            isPrimary: boolean;
            user: {
                id: string;
                name: string | null;
                email: string;
                phone: string | null;
                isActive: boolean;
                role: import("@prisma/client").$Enums.RoleName;
            };
            createdAt: Date;
        }[];
        adminCount: number;
        distanceKm: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listBroadcasts(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
        url: string | null;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }[]>;
    markBroadcastRead(user: AuthUser, id: string): Promise<{
        url: string | null;
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        contentType: import("@prisma/client").$Enums.BroadcastContentType;
        body: string | null;
        readAt: Date | null;
        usefulLinkId: string | null;
        jobAlertId: string | null;
    }>;
}
