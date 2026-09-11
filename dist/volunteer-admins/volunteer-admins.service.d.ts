import { RoleName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerAdminDto, UpdateVolunteerAdminDto } from './dto/volunteer-admin.dto';
export declare class VolunteerAdminsService {
    private prisma;
    constructor(prisma: PrismaService);
    private sanitize;
    findAll(filters: {
        search?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            name: RoleName;
        };
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            name: RoleName;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateVolunteerAdminDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            name: RoleName;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateVolunteerAdminDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        isActive: boolean;
        role: {
            id: string;
            name: RoleName;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
