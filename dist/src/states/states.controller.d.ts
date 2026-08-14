import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { StatesService } from './states.service';
export declare class StatesController {
    private readonly statesService;
    constructor(statesService: StatesService);
    findAll(search?: string, isActive?: string): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    create(dto: CreateStateDto): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateStateDto): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        code: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
    }>;
}
