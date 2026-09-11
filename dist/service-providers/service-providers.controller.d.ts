import { type AuthUser } from '../common/decorators/current-user.decorator';
import { AssignProviderAdminDto, CreateServiceProviderDto, ListServiceProvidersQueryDto, RejectServiceProviderDto, UpdateServiceProviderDto } from './dto/service-provider.dto';
import { ServiceProvidersService } from './service-providers.service';
export declare class ServiceProvidersController {
    private readonly serviceProvidersService;
    constructor(serviceProvidersService: ServiceProvidersService);
    searchPublic(query: ListServiceProvidersQueryDto): Promise<{
        items: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOnePublic(id: string): Promise<{
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
    findAll(user: AuthUser, query: ListServiceProvidersQueryDto): Promise<{
        items: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: AuthUser): Promise<{
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
    create(dto: CreateServiceProviderDto, user: AuthUser): Promise<{
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
    update(id: string, dto: UpdateServiceProviderDto, user: AuthUser): Promise<{
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
    remove(id: string, user: AuthUser): Promise<{
        id: string;
        deleted: boolean;
    }>;
    approve(id: string, user: AuthUser): Promise<{
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
    reject(id: string, dto: RejectServiceProviderDto, user: AuthUser): Promise<{
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
    listAdmins(id: string, user: AuthUser): Promise<{
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
    }[]>;
    assignAdmin(id: string, dto: AssignProviderAdminDto, user: AuthUser): Promise<{
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
    }[]>;
    removeAdmin(id: string, userId: string, user: AuthUser): Promise<{
        serviceProviderId: string;
        userId: string;
        deleted: boolean;
    }>;
}
