import { BecomeApplicationStatus, BecomeQuestionType, BecomeTarget } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBecomeApplicationDto, CreateBecomeQuestionDto, UpdateBecomeApplicationDto, UpdateBecomeQuestionDto } from './dto/become.dto';
export declare class BecomeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private serializeQuestion;
    private validateQuestionShape;
    listQuestionsAdmin(target?: BecomeTarget): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    listQuestionsPublic(target: BecomeTarget): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createQuestion(dto: CreateBecomeQuestionDto): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateQuestion(id: string, dto: UpdateBecomeQuestionDto): Promise<{
        options: string[];
        id: string;
        target: BecomeTarget;
        prompt: string;
        type: BecomeQuestionType;
        sortOrder: number;
        isRequired: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeQuestion(id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listApplications(filters?: {
        target?: BecomeTarget;
        status?: BecomeApplicationStatus;
        search?: string;
    }): Promise<({
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
    getApplication(id: string): Promise<{
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
    private roleForTarget;
    private promoteApplicantOnApproval;
    updateApplication(id: string, dto: UpdateBecomeApplicationDto): Promise<{
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
    listMine(params: {
        userId?: string;
        email?: string;
    }): Promise<{
        applications: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        }[];
        pending: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        } | null;
        latest: {
            id: string;
            target: import("@prisma/client").$Enums.BecomeTarget;
            status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        } | null;
        approvedTargets: import("@prisma/client").$Enums.BecomeTarget[];
        isVolunteer: boolean;
        menuDisabled: boolean;
        allowedTargets: import("@prisma/client").$Enums.BecomeTarget[];
    }>;
    submitApplication(dto: CreateBecomeApplicationDto): Promise<{
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
