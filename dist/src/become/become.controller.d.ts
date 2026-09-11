import { BecomeApplicationStatus, BecomeTarget } from '@prisma/client';
import { BecomeService } from './become.service';
import { CreateBecomeQuestionDto, UpdateBecomeApplicationDto, UpdateBecomeQuestionDto } from './dto/become.dto';
export declare class BecomeQuestionsController {
    private readonly become;
    constructor(become: BecomeService);
    list(target?: BecomeTarget): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: import("@prisma/client").BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateBecomeQuestionDto): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: import("@prisma/client").BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateBecomeQuestionDto): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: import("@prisma/client").BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
export declare class BecomeApplicationsController {
    private readonly become;
    constructor(become: BecomeService);
    list(target?: BecomeTarget, status?: BecomeApplicationStatus, search?: string): Promise<({
        _count: {
            answers: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        phone: string | null;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        target: import("@prisma/client").$Enums.BecomeTarget;
        adminNote: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
            state: {
                id: string;
                name: string;
            } | null;
            email: string;
            phone: string | null;
            stateId: string | null;
        } | null;
        answers: {
            id: string;
            createdAt: Date;
            questionId: string | null;
            answerText: string;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            selectedOption: string | null;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        phone: string | null;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        target: import("@prisma/client").$Enums.BecomeTarget;
        adminNote: string | null;
    }>;
    update(id: string, dto: UpdateBecomeApplicationDto): Promise<{
        user: {
            id: string;
            name: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
            state: {
                id: string;
                name: string;
            } | null;
            email: string;
            phone: string | null;
            stateId: string | null;
        } | null;
        answers: {
            id: string;
            createdAt: Date;
            questionId: string | null;
            answerText: string;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            selectedOption: string | null;
            applicationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        email: string;
        phone: string | null;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        target: import("@prisma/client").$Enums.BecomeTarget;
        adminNote: string | null;
    }>;
}
