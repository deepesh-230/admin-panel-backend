import { RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStateAdminDto, UpdateStateAdminDto } from './dto/state-admin.dto';
export declare class StateAdminsService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitize;
    private scopedStateId;
    findAll(currentUser: AuthUser, filters: {
        search?: string;
        stateId?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: {
            id: string;
            name: RoleName;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
            isActive: boolean;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, currentUser: AuthUser): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: {
            id: string;
            name: RoleName;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
            isActive: boolean;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateStateAdminDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: {
            id: string;
            name: RoleName;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
            isActive: boolean;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateStateAdminDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: {
            id: string;
            name: RoleName;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
            isActive: boolean;
        } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
