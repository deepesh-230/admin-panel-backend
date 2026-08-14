import { RoleName } from '@prisma/client';
import { type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(user: AuthUser, query: ListUsersQueryDto): Promise<{
        items: {
            id: string;
            email: string;
            name: string | null;
            phone: string | null;
            isActive: boolean;
            stateId: string | null;
            role: import("@prisma/client").$Enums.RoleName;
            roleDetails: {
                id: string;
                name: RoleName;
                description: string | null;
            };
            state: {
                id: string;
                name: string;
                code: string | null;
            } | null;
            states: {
                isPrimary: boolean;
                id: string;
                name: string;
                code: string | null;
            }[];
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
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: import("@prisma/client").$Enums.RoleName;
        roleDetails: {
            id: string;
            name: RoleName;
            description: string | null;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        states: {
            isPrimary: boolean;
            id: string;
            name: string;
            code: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateUserDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: import("@prisma/client").$Enums.RoleName;
        roleDetails: {
            id: string;
            name: RoleName;
            description: string | null;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        states: {
            isPrimary: boolean;
            id: string;
            name: string;
            code: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: import("@prisma/client").$Enums.RoleName;
        roleDetails: {
            id: string;
            name: RoleName;
            description: string | null;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        states: {
            isPrimary: boolean;
            id: string;
            name: string;
            code: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateUserStatusDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        stateId: string | null;
        role: import("@prisma/client").$Enums.RoleName;
        roleDetails: {
            id: string;
            name: RoleName;
            description: string | null;
        };
        state: {
            id: string;
            name: string;
            code: string | null;
        } | null;
        states: {
            isPrimary: boolean;
            id: string;
            name: string;
            code: string | null;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: AuthUser): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
