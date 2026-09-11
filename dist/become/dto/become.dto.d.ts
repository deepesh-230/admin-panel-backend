import { BecomeApplicationStatus, BecomeQuestionType, BecomeTarget } from '@prisma/client';
export declare class CreateBecomeQuestionDto {
    target: BecomeTarget;
    prompt: string;
    type: BecomeQuestionType;
    options?: string[];
    sortOrder?: number;
    isRequired?: boolean;
    isActive?: boolean;
}
export declare class UpdateBecomeQuestionDto {
    target?: BecomeTarget;
    prompt?: string;
    type?: BecomeQuestionType;
    options?: string[] | null;
    sortOrder?: number;
    isRequired?: boolean;
    isActive?: boolean;
}
export declare class BecomeAnswerInputDto {
    questionId: string;
    answerText: string;
}
export declare class CreateBecomeApplicationDto {
    target: BecomeTarget;
    name: string;
    email: string;
    phone?: string;
    userId?: string;
    answers: BecomeAnswerInputDto[];
}
export declare class UpdateBecomeApplicationDto {
    status?: BecomeApplicationStatus;
    adminNote?: string | null;
    stateId?: string;
}
