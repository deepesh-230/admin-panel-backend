import { type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateEnquiryDto, ListEnquiriesQueryDto, UpdateEnquiryDto } from './dto/enquiry.dto';
import { EnquiriesService } from './enquiries.service';
export declare class EnquiriesController {
    private readonly enquiriesService;
    constructor(enquiriesService: EnquiriesService);
    findAll(user: AuthUser, query: ListEnquiriesQueryDto): Promise<({
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
        category: string;
        id: string;
        name: string | null;
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
        date: string;
        marketplaceProductId: string | null;
    })[]>;
    findOne(id: string, user: AuthUser): Promise<{
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
        category: string;
        id: string;
        name: string | null;
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
        date: string;
        marketplaceProductId: string | null;
    }>;
    create(user: AuthUser, body: CreateEnquiryDto): Promise<{
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
        category: string;
        id: string;
        name: string | null;
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
        date: string;
        marketplaceProductId: string | null;
    }>;
    update(id: string, user: AuthUser, body: UpdateEnquiryDto): Promise<{
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        provider: {
            id: string;
            name: string;
            stateId: string;
        } | null;
    } & {
        category: string;
        id: string;
        name: string | null;
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
        date: string;
        marketplaceProductId: string | null;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        category: string;
        id: string;
        name: string | null;
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
        date: string;
        marketplaceProductId: string | null;
    }>;
}
