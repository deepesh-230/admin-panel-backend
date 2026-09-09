import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BecomeApplicationStatus,
  BecomeQuestionType,
  BecomeTarget,
  Prisma,
  RoleName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBecomeApplicationDto,
  CreateBecomeQuestionDto,
  UpdateBecomeApplicationDto,
  UpdateBecomeQuestionDto,
} from './dto/become.dto';

function normalizeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => String(o ?? '').trim())
    .filter((o) => o.length > 0);
}

function optionsFromJson(value: Prisma.JsonValue | null | undefined): string[] {
  return normalizeOptions(value);
}

@Injectable()
export class BecomeService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeQuestion(row: {
    id: string;
    target: BecomeTarget;
    prompt: string;
    type: BecomeQuestionType;
    options: Prisma.JsonValue | null;
    sortOrder: number;
    isRequired: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...row,
      options: row.type === BecomeQuestionType.SINGLE_CHOICE ? optionsFromJson(row.options) : [],
    };
  }

  private validateQuestionShape(
    type: BecomeQuestionType,
    options: string[] | null | undefined,
  ) {
    if (type === BecomeQuestionType.SINGLE_CHOICE) {
      const opts = normalizeOptions(options);
      if (opts.length < 2) {
        throw new BadRequestException('Multiple choice questions need at least 2 options');
      }
      return opts;
    }
    return [];
  }

  listQuestionsAdmin(target?: BecomeTarget) {
    return this.prisma.becomeQuestion
      .findMany({
        where: target ? { target } : undefined,
        orderBy: [{ target: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      .then((rows) => rows.map((r) => this.serializeQuestion(r)));
  }

  listQuestionsPublic(target: BecomeTarget) {
    return this.prisma.becomeQuestion
      .findMany({
        where: { target, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
      .then((rows) => rows.map((r) => this.serializeQuestion(r)));
  }

  async createQuestion(dto: CreateBecomeQuestionDto) {
    const options = this.validateQuestionShape(dto.type, dto.options);
    const row = await this.prisma.becomeQuestion.create({
      data: {
        target: dto.target,
        prompt: dto.prompt.trim(),
        type: dto.type,
        options:
          dto.type === BecomeQuestionType.SINGLE_CHOICE
            ? (options as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        sortOrder: dto.sortOrder ?? 0,
        isRequired: dto.isRequired ?? true,
        isActive: dto.isActive ?? true,
      },
    });
    return this.serializeQuestion(row);
  }

  async updateQuestion(id: string, dto: UpdateBecomeQuestionDto) {
    const existing = await this.prisma.becomeQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');

    const nextType = dto.type ?? existing.type;
    const nextOptions =
      dto.options !== undefined
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
              options:
                nextType === BecomeQuestionType.SINGLE_CHOICE
                  ? (options as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            }
          : {}),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return this.serializeQuestion(row);
  }

  async removeQuestion(id: string) {
    const existing = await this.prisma.becomeQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');
    await this.prisma.becomeQuestion.delete({ where: { id } });
    return { id, deleted: true };
  }

  async listApplications(filters?: {
    target?: BecomeTarget;
    status?: BecomeApplicationStatus;
    search?: string;
  }) {
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

  async getApplication(id: string) {
    const row = await this.prisma.becomeApplication.findUnique({
      where: { id },
      include: {
        answers: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!row) throw new NotFoundException('Application not found');
    return row;
  }

  async updateApplication(id: string, dto: UpdateBecomeApplicationDto) {
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

  async listMine(params: { userId?: string; email?: string }) {
    const userId = params.userId?.trim() || undefined;
    const email = params.email?.trim().toLowerCase() || undefined;
    if (!userId && !email) {
      throw new BadRequestException('userId or email is required');
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

    const pending = applications.find((a) => a.status === BecomeApplicationStatus.PENDING);
    const approvedTargets = applications
      .filter((a) => a.status === BecomeApplicationStatus.APPROVED)
      .map((a) => a.target);
    const isVolunteer =
      approvedTargets.includes(BecomeTarget.VOLUNTEER) ||
      (userId
        ? Boolean(
            await this.prisma.user.findFirst({
              where: {
                id: userId,
                role: { name: RoleName.VOLUNTEER },
              },
              select: { id: true },
            }),
          )
        : false);

    const allowedTargets = (Object.values(BecomeTarget) as BecomeTarget[]).filter((target) => {
      if (approvedTargets.includes(target)) return false;
      if (pending) return false;
      if (isVolunteer && target === BecomeTarget.PROVIDER_ADMIN) return false;
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

  async submitApplication(dto: CreateBecomeApplicationDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Name is required');

    const identityOr = [
      { email },
      ...(dto.userId ? [{ userId: dto.userId }] : []),
    ];

    const anyPending = await this.prisma.becomeApplication.findFirst({
      where: {
        status: BecomeApplicationStatus.PENDING,
        OR: identityOr,
      },
    });
    if (anyPending) {
      throw new BadRequestException(
        'You already have a pending application. Wait for admin review before applying again.',
      );
    }

    const alreadyApproved = await this.prisma.becomeApplication.findFirst({
      where: {
        target: dto.target,
        status: BecomeApplicationStatus.APPROVED,
        OR: identityOr,
      },
    });
    if (alreadyApproved) {
      throw new BadRequestException('You are already approved for this role');
    }

    const isVolunteer =
      Boolean(
        await this.prisma.becomeApplication.findFirst({
          where: {
            target: BecomeTarget.VOLUNTEER,
            status: BecomeApplicationStatus.APPROVED,
            OR: identityOr,
          },
          select: { id: true },
        }),
      ) ||
      (dto.userId
        ? Boolean(
            await this.prisma.user.findFirst({
              where: { id: dto.userId, role: { name: RoleName.VOLUNTEER } },
              select: { id: true },
            }),
          )
        : false);

    if (isVolunteer && dto.target === BecomeTarget.PROVIDER_ADMIN) {
      throw new BadRequestException(
        'Volunteers can apply to become state admin, but not provider admin',
      );
    }

    const questions = await this.prisma.becomeQuestion.findMany({
      where: { target: dto.target, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (questions.length === 0) {
      throw new BadRequestException('No questions are configured for this role yet');
    }

    const answerByQuestion = new Map(
      dto.answers.map((a) => [a.questionId, a.answerText?.trim() ?? '']),
    );

    const answerRows: Prisma.BecomeAnswerCreateWithoutApplicationInput[] = [];

    for (const question of questions) {
      const answerText = answerByQuestion.get(question.id) ?? '';
      if (question.isRequired && !answerText) {
        throw new BadRequestException(`Please answer: ${question.prompt}`);
      }
      if (!answerText && !question.isRequired) {
        continue;
      }

      const options = optionsFromJson(question.options);
      let selectedOption: string | null = null;

      if (question.type === BecomeQuestionType.SINGLE_CHOICE) {
        if (!options.includes(answerText)) {
          throw new BadRequestException(
            `Invalid choice for: ${question.prompt}`,
          );
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
        status: BecomeApplicationStatus.PENDING,
        answers: { create: answerRows },
      },
      include: { answers: true },
    });
  }
}
