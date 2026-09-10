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
        target: import("@prisma/client").$Enums.BecomeTarget;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        email: string;
        phone: string | null;
        adminNote: string | null;
    })[]>;
    findOne(id: string): Promise<{
        answers: {
            id: string;
            createdAt: Date;
            applicationId: string;
            questionId: string | null;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            answerText: string;
            selectedOption: string | null;
        }[];
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
            stateId: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
        } | null;
    } & {
        id: string;
        target: import("@prisma/client").$Enums.BecomeTarget;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        email: string;
        phone: string | null;
        adminNote: string | null;
    }>;
    update(id: string, dto: UpdateBecomeApplicationDto): Promise<{
        answers: {
            id: string;
            createdAt: Date;
            applicationId: string;
            questionId: string | null;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            answerText: string;
            selectedOption: string | null;
        }[];
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
            stateId: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
        } | null;
    } & {
        id: string;
        target: import("@prisma/client").$Enums.BecomeTarget;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: string | null;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        email: string;
        phone: string | null;
        adminNote: string | null;
    }>;
}
