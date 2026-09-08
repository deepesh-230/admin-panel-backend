import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { StatesService } from './states.service';
export declare class StatesController {
    private readonly statesService;
    constructor(statesService: StatesService);
    findAll(search?: string, isActive?: string): Promise<{
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
