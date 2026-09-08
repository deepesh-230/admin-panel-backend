import { PrismaService } from '../prisma/prisma.service';
import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
export declare class StatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, isActive?: boolean): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    create(dto: CreateStateDto): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateStateDto): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        code: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
}
