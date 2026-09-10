import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BecomeApplicationStatus,
  BecomeQuestionType,
  BecomeTarget,
} from '@prisma/client';

export class CreateBecomeQuestionDto {
  @IsEnum(BecomeTarget)
  target!: BecomeTarget;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  prompt!: string;

  @IsEnum(BecomeQuestionType)
  type!: BecomeQuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBecomeQuestionDto {
  @IsOptional()
  @IsEnum(BecomeTarget)
  target?: BecomeTarget;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  prompt?: string;

  @IsOptional()
  @IsEnum(BecomeQuestionType)
  type?: BecomeQuestionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[] | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BecomeAnswerInputDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  @MaxLength(2000)
  answerText!: string;
}

export class CreateBecomeApplicationDto {
  @IsEnum(BecomeTarget)
  target!: BecomeTarget;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => BecomeAnswerInputDto)
  answers!: BecomeAnswerInputDto[];
}

export class UpdateBecomeApplicationDto {
  @IsOptional()
  @IsEnum(BecomeApplicationStatus)
  status?: BecomeApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNote?: string | null;

  /** Required when approving a STATE_ADMIN application if the user has no state yet. */
  @IsOptional()
  @IsUUID()
  stateId?: string;
}
