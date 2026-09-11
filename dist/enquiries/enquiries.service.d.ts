import { EnquiryStatus } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(currentUser: AuthUser, searchQuery?: string, kind?: string, status?: EnquiryStatus): Promise<({
        state: {
            name: string;
            id: string;
            code: string | null;
        } | null;
        provider: {
            name: string;
            id: string;
            stateId: string;
        } | null;
    } & {
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
    })[]>;
    findOne(id: string, currentUser: AuthUser): Promise<{
        state: {
            name: string;
            id: string;
            code: string | null;
        } | null;
        provider: {
            name: string;
            id: string;
            stateId: string;
        } | null;
    } & {
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
    create(currentUser: AuthUser, data: CreateEnquiryDto): Promise<{
        state: {
            name: string;
            id: string;
            code: string | null;
        } | null;
        provider: {
            name: string;
            id: string;
            stateId: string;
        } | null;
    } & {
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
    update(id: string, currentUser: AuthUser, data: UpdateEnquiryDto): Promise<{
        state: {
            name: string;
            id: string;
            code: string | null;
        } | null;
        provider: {
            name: string;
            id: string;
            stateId: string;
        } | null;
    } & {
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
    remove(id: string, currentUser: AuthUser): Promise<{
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
    private scopeWhere;
    private assertCanAccess;
    private assignedProviderIds;
    private resolveWriteFields;
}
