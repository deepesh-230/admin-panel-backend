import { type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateEnquiryDto, ListEnquiriesQueryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    findAll(user: AuthUser, query: ListEnquiriesQueryDto): Promise<({
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
    findOne(id: string, user: AuthUser): Promise<{
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
    create(user: AuthUser, body: CreateEnquiryDto): Promise<{
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
    update(id: string, user: AuthUser, body: UpdateEnquiryDto): Promise<{
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
    remove(id: string, user: AuthUser): Promise<{
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
}
