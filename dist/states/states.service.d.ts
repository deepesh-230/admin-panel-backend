import { PrismaService } from '../prisma/prisma.service';
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
export declare class StatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, isActive?: boolean): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    create(dto: CreateStateDto): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateStateDto): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
}
