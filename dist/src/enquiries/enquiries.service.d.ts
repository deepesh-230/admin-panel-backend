import { EnquiryStatus } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
export declare class EnquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(currentUser: AuthUser, searchQuery?: string, kind?: string, status?: EnquiryStatus): Promise<({
        state: {
            id: string;
            code: string | null;
            name: string;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
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
    })[]>;
    findOne(id: string, currentUser: AuthUser): Promise<{
        state: {
            id: string;
            code: string | null;
            name: string;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
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
    create(currentUser: AuthUser, data: CreateEnquiryDto): Promise<{
        state: {
            id: string;
            code: string | null;
            name: string;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
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
    update(id: string, currentUser: AuthUser, data: UpdateEnquiryDto): Promise<{
        state: {
            id: string;
            code: string | null;
            name: string;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
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
    remove(id: string, currentUser: AuthUser): Promise<{
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
    private scopeWhere;
    private assertCanAccess;
    private assignedProviderIds;
    private resolveWriteFields;
}
