import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AssignProviderAdminDto, CreateServiceProviderDto, ListServiceProvidersQueryDto, UpdateServiceProviderDto } from './dto/service-provider.dto';
export declare class ServiceProvidersService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitize;
    private assertCategoryLinks;
    private assertProviderAdminAccess;
    private getScopedOrThrow;
    private resolveKeywordSubcategoryIds;
    private buildSearchWhere;
    private runSearch;
    findAll(currentUser: AuthUser, query: ListServiceProvidersQueryDto): Promise<{
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
            createdById: string | null;
            approvedById: string | null;
            approvedAt: Date | null;
            category: {
                id: string;
                name: string;
            };
            subcategory: {
                id: string;
                name: string;
                categoryId: string;
            } | null;
            state: {
                id: string;
                code: string | null;
                name: string;
            };
            createdBy: {
                id: string;
                name: string | null;
                email: string;
            } | null;
            approvedBy: {
                id: string;
                name: string | null;
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
            createdById: string | null;
            approvedById: string | null;
            approvedAt: Date | null;
            category: {
                id: string;
                name: string;
            };
            subcategory: {
                id: string;
                name: string;
                categoryId: string;
            } | null;
            state: {
                id: string;
                code: string | null;
                name: string;
            };
            createdBy: {
                id: string;
                name: string | null;
                email: string;
            } | null;
            approvedBy: {
                id: string;
                name: string | null;
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
    findOne(id: string, currentUser: AuthUser): Promise<{
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
    create(dto: CreateServiceProviderDto, currentUser: AuthUser): Promise<{
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
    update(id: string, dto: UpdateServiceProviderDto, currentUser: AuthUser): Promise<{
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
    remove(id: string, currentUser: AuthUser): Promise<{
        id: string;
        deleted: boolean;
    }>;
    approve(id: string, currentUser: AuthUser): Promise<{
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
    reject(id: string, reason: string, currentUser: AuthUser): Promise<{
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
        createdById: string | null;
        approvedById: string | null;
        approvedAt: Date | null;
        category: {
            id: string;
            name: string;
        };
        subcategory: {
            id: string;
            name: string;
            categoryId: string;
        } | null;
        state: {
            id: string;
            code: string | null;
            name: string;
        };
        createdBy: {
            id: string;
            name: string | null;
            email: string;
        } | null;
        approvedBy: {
            id: string;
            name: string | null;
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
    listAdmins(id: string, currentUser: AuthUser): Promise<{
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
    assignAdmin(id: string, dto: AssignProviderAdminDto, currentUser: AuthUser): Promise<{
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
    removeAdmin(id: string, userId: string, currentUser: AuthUser): Promise<{
        serviceProviderId: string;
        userId: string;
        deleted: boolean;
    }>;
}
