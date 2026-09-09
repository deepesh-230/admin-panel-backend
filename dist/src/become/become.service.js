"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BecomeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
function normalizeOptions(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw
        .map((o) => String(o ?? '').trim())
        .filter((o) => o.length > 0);
}
function optionsFromJson(value) {
    return normalizeOptions(value);
}
let BecomeService = class BecomeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    serializeQuestion(row) {
        return {
            ...row,
            options: row.type === client_1.BecomeQuestionType.SINGLE_CHOICE ? optionsFromJson(row.options) : [],
        };
    }
    validateQuestionShape(type, options) {
        if (type === client_1.BecomeQuestionType.SINGLE_CHOICE) {
            const opts = normalizeOptions(options);
            if (opts.length < 2) {
                throw new common_1.BadRequestException('Multiple choice questions need at least 2 options');
            }
            return opts;
        }
        return [];
    }
    listQuestionsAdmin(target) {
        return this.prisma.becomeQuestion
            .findMany({
            where: target ? { target } : undefined,
            orderBy: [{ target: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        })
            .then((rows) => rows.map((r) => this.serializeQuestion(r)));
    }
    listQuestionsPublic(target) {
        return this.prisma.becomeQuestion
            .findMany({
            where: { target, isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        })
            .then((rows) => rows.map((r) => this.serializeQuestion(r)));
    }
    async createQuestion(dto) {
        const options = this.validateQuestionShape(dto.type, dto.options);
        const row = await this.prisma.becomeQuestion.create({
            data: {
                target: dto.target,
                prompt: dto.prompt.trim(),
                type: dto.type,
                options: dto.type === client_1.BecomeQuestionType.SINGLE_CHOICE
                    ? options
                    : client_1.Prisma.JsonNull,
                sortOrder: dto.sortOrder ?? 0,
                isRequired: dto.isRequired ?? true,
                isActive: dto.isActive ?? true,
            },
        });
        return this.serializeQuestion(row);
    }
    async updateQuestion(id, dto) {
        const existing = await this.prisma.becomeQuestion.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Question not found');
        const nextType = dto.type ?? existing.type;
        const nextOptions = dto.options !== undefined
            ? dto.options
            : optionsFromJson(existing.options);
        const options = this.validateQuestionShape(nextType, nextOptions);
        const row = await this.prisma.becomeQuestion.update({
            where: { id },
            data: {
                ...(dto.target !== undefined && { target: dto.target }),
                ...(dto.prompt !== undefined && { prompt: dto.prompt.trim() }),
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.options !== undefined || dto.type !== undefined
                    ? {
                        options: nextType === client_1.BecomeQuestionType.SINGLE_CHOICE
                            ? options
                            : client_1.Prisma.JsonNull,
                    }
                    : {}),
                ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
                ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
        return this.serializeQuestion(row);
    }
    async removeQuestion(id) {
        const existing = await this.prisma.becomeQuestion.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Question not found');
        await this.prisma.becomeQuestion.delete({ where: { id } });
        return { id, deleted: true };
    }
    async listApplications(filters) {
        const q = filters?.search?.trim();
        return this.prisma.becomeApplication.findMany({
            where: {
                ...(filters?.target && { target: filters.target }),
                ...(filters?.status && { status: filters.status }),
                ...(q
                    ? {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { email: { contains: q, mode: 'insensitive' } },
                            { phone: { contains: q, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                _count: { select: { answers: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApplication(id) {
        const row = await this.prisma.becomeApplication.findUnique({
            where: { id },
            include: {
                answers: { orderBy: { createdAt: 'asc' } },
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Application not found');
        return row;
    }
    async updateApplication(id, dto) {
        await this.getApplication(id);
        return this.prisma.becomeApplication.update({
            where: { id },
            data: {
                ...(dto.status !== undefined && { status: dto.status }),
                ...(dto.adminNote !== undefined && {
                    adminNote: dto.adminNote?.trim() || null,
                }),
            },
            include: {
                answers: { orderBy: { createdAt: 'asc' } },
            },
        });
    }
    async listMine(params) {
        const userId = params.userId?.trim() || undefined;
        const email = params.email?.trim().toLowerCase() || undefined;
        if (!userId && !email) {
            throw new common_1.BadRequestException('userId or email is required');
        }
        const applications = await this.prisma.becomeApplication.findMany({
            where: {
                OR: [
                    ...(userId ? [{ userId }] : []),
                    ...(email ? [{ email }] : []),
                ],
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                target: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const pending = applications.find((a) => a.status === client_1.BecomeApplicationStatus.PENDING);
        const approvedTargets = applications
            .filter((a) => a.status === client_1.BecomeApplicationStatus.APPROVED)
            .map((a) => a.target);
        const isVolunteer = approvedTargets.includes(client_1.BecomeTarget.VOLUNTEER) ||
            (userId
                ? Boolean(await this.prisma.user.findFirst({
                    where: {
                        id: userId,
                        role: { name: client_1.RoleName.VOLUNTEER },
                    },
                    select: { id: true },
                }))
                : false);
        const allowedTargets = Object.values(client_1.BecomeTarget).filter((target) => {
            if (approvedTargets.includes(target))
                return false;
            if (pending)
                return false;
            if (isVolunteer && target === client_1.BecomeTarget.PROVIDER_ADMIN)
                return false;
            return true;
        });
        return {
            applications,
            pending: pending
                ? { id: pending.id, target: pending.target, status: pending.status }
                : null,
            latest: applications[0]
                ? {
                    id: applications[0].id,
                    target: applications[0].target,
                    status: applications[0].status,
                }
                : null,
            approvedTargets,
            isVolunteer,
            menuDisabled: Boolean(pending),
            allowedTargets,
        };
    }
    async submitApplication(dto) {
        const email = dto.email.trim().toLowerCase();
        const name = dto.name.trim();
        if (!name)
            throw new common_1.BadRequestException('Name is required');
        const identityOr = [
            { email },
            ...(dto.userId ? [{ userId: dto.userId }] : []),
        ];
        const anyPending = await this.prisma.becomeApplication.findFirst({
            where: {
                status: client_1.BecomeApplicationStatus.PENDING,
                OR: identityOr,
            },
        });
        if (anyPending) {
            throw new common_1.BadRequestException('You already have a pending application. Wait for admin review before applying again.');
        }
        const alreadyApproved = await this.prisma.becomeApplication.findFirst({
            where: {
                target: dto.target,
                status: client_1.BecomeApplicationStatus.APPROVED,
                OR: identityOr,
            },
        });
        if (alreadyApproved) {
            throw new common_1.BadRequestException('You are already approved for this role');
        }
        const isVolunteer = Boolean(await this.prisma.becomeApplication.findFirst({
            where: {
                target: client_1.BecomeTarget.VOLUNTEER,
                status: client_1.BecomeApplicationStatus.APPROVED,
                OR: identityOr,
            },
            select: { id: true },
        })) ||
            (dto.userId
                ? Boolean(await this.prisma.user.findFirst({
                    where: { id: dto.userId, role: { name: client_1.RoleName.VOLUNTEER } },
                    select: { id: true },
                }))
                : false);
        if (isVolunteer && dto.target === client_1.BecomeTarget.PROVIDER_ADMIN) {
            throw new common_1.BadRequestException('Volunteers can apply to become state admin, but not provider admin');
        }
        const questions = await this.prisma.becomeQuestion.findMany({
            where: { target: dto.target, isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        if (questions.length === 0) {
            throw new common_1.BadRequestException('No questions are configured for this role yet');
        }
        const answerByQuestion = new Map(dto.answers.map((a) => [a.questionId, a.answerText?.trim() ?? '']));
        const answerRows = [];
        for (const question of questions) {
            const answerText = answerByQuestion.get(question.id) ?? '';
            if (question.isRequired && !answerText) {
                throw new common_1.BadRequestException(`Please answer: ${question.prompt}`);
            }
            if (!answerText && !question.isRequired) {
                continue;
            }
            const options = optionsFromJson(question.options);
            let selectedOption = null;
            if (question.type === client_1.BecomeQuestionType.SINGLE_CHOICE) {
                if (!options.includes(answerText)) {
                    throw new common_1.BadRequestException(`Invalid choice for: ${question.prompt}`);
                }
                selectedOption = answerText;
            }
            answerRows.push({
                question: { connect: { id: question.id } },
                questionPrompt: question.prompt,
                questionType: question.type,
                answerText,
                selectedOption,
            });
        }
        return this.prisma.becomeApplication.create({
            data: {
                target: dto.target,
                name,
                email,
                phone: dto.phone?.trim() || null,
                userId: dto.userId || null,
                status: client_1.BecomeApplicationStatus.PENDING,
                answers: { create: answerRows },
            },
            include: { answers: true },
        });
    }
};
exports.BecomeService = BecomeService;
exports.BecomeService = BecomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BecomeService);
//# sourceMappingURL=become.service.js.map