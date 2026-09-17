import { CategoryType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

const CODE_REGEX = /^[A-Za-z0-9_]+$/;

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(CODE_REGEX, {
    message: 'code must use letters, numbers, and underscores only',
  })
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(CODE_REGEX, {
    message: 'code must use letters, numbers, and underscores only',
  })
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
