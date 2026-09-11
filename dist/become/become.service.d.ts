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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        userId: string | null;
        target: import("@prisma/client").$Enums.BecomeTarget;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        adminNote: string | null;
    })[]>;
    getApplication(id: string): Promise<{
        user: {
            name: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
            state: {
                name: string;
                id: string;
            } | null;
            id: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        userId: string | null;
        target: import("@prisma/client").$Enums.BecomeTarget;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        adminNote: string | null;
    }>;
    private roleForTarget;
    private promoteApplicantOnApproval;
    updateApplication(id: string, dto: UpdateBecomeApplicationDto): Promise<{
        user: {
            name: string | null;
            role: {
                name: import("@prisma/client").$Enums.RoleName;
            };
            state: {
                name: string;
                id: string;
            } | null;
            id: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        userId: string | null;
        target: import("@prisma/client").$Enums.BecomeTarget;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        adminNote: string | null;
    }>;
    listMine(params: {
        userId?: string;
        email?: string;
    }): Promise<{
        applications: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            target: import("@prisma/client").$Enums.BecomeTarget;
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
            questionId: string | null;
            answerText: string;
            questionPrompt: string;
            questionType: import("@prisma/client").$Enums.BecomeQuestionType;
            selectedOption: string | null;
            applicationId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        userId: string | null;
        target: import("@prisma/client").$Enums.BecomeTarget;
        status: import("@prisma/client").$Enums.BecomeApplicationStatus;
        adminNote: string | null;
    }>;
}
