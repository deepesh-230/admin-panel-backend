import { RoleName } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    role: RoleName;
    stateId?: string;
    isActive?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: RoleName;
    stateId?: string | null;
    isActive?: boolean;
    password?: string;
}
export declare class UpdateUserStatusDto {
    isActive: boolean;
}
export declare class ListUsersQueryDto {
    search?: string;
    stateId?: string;
    role?: RoleName;
    isActive?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
