import { RoleName } from '@prisma/client';
import { CreateVolunteerAdminDto, UpdateVolunteerAdminDto } from './dto/volunteer-admin.dto';
import { VolunteerAdminsService } from './volunteer-admins.service';
export declare class VolunteerAdminsController {
    private readonly volunteerAdminsService;
    constructor(volunteerAdminsService: VolunteerAdminsService);
    findAll(search?: string, isActive?: string): Promise<{
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
