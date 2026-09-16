import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

const CODE_REGEX = /^[A-Za-z0-9_]+$/;

export class CreateSubcategoryDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  name!: string;

  @IsString()
  @Matches(CODE_REGEX, {
    message: 'code must use letters, numbers, and underscores only',
  })
  code!: string;

  @IsOptional()
  @IsString()
  slug?: string;

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
}

export class UpdateSubcategoryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

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
  slug?: string;

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
}
