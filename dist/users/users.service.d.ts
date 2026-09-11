import { RoleName } from '@prisma/client';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitize;
    private getRole;
    findAll(currentUser: AuthUser, query: ListUsersQueryDto): Promise<{
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
    findOne(id: string, currentUser: AuthUser): Promise<{
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
    create(dto: CreateUserDto, currentUser: AuthUser): Promise<{
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
    update(id: string, dto: UpdateUserDto, currentUser: AuthUser): Promise<{
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
    updateStatus(id: string, isActive: boolean, currentUser: AuthUser): Promise<{
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
    remove(id: string, currentUser: AuthUser): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
