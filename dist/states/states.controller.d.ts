import { CreateStateDto, UpdateStateDto } from './dto/state.dto';
import { StatesService } from './states.service';
export declare class StatesController {
    private readonly statesService;
    constructor(statesService: StatesService);
    findAll(search?: string, isActive?: string): Promise<{
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
