import { RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateStateAdminDto, UpdateStateAdminDto } from './dto/state-admin.dto';
import { StateAdminsService } from './state-admins.service';
export declare class StateAdminsController {
    private readonly stateAdminsService;
    constructor(stateAdminsService: StateAdminsService);
    findAll(user: AuthUser, search?: string, stateId?: string, isActive?: string): Promise<{
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
    findOne(id: string, user: AuthUser): Promise<{
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
