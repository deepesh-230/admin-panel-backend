import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType, ProviderApprovalStatus } from '@prisma/client';

export class CreateServiceProviderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  /** Preferred: multiple subcategories under the same category. */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subcategoryIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  landline?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsUUID()
  stateId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  googlePlaceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  about?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  services?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverPhotoUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ProviderApprovalStatus)
  approvalStatus?: ProviderApprovalStatus;
}

export class UpdateServiceProviderDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subcategoryIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  landline?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  googlePlaceId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  about?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  services?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverPhotoUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RejectServiceProviderDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}

export class AssignProviderAdminDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class ListServiceProvidersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** Explicit keyword term (also resolves related subcategory keywords) */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** One id or comma-separated ids for multi-state filters. */
  @IsOptional()
  @IsString()
  stateId?: string;

  /** One id or comma-separated ids for multi-category filters. */
  @IsOptional()
  @IsString()
  categoryId?: string;

  /** CARE = Service (mobile Home), SERVICE = Emergency Service (mobile Service tab) */
  @IsOptional()
  @IsEnum(CategoryType)
  categoryType?: CategoryType;

  /** One id or comma-separated ids for multi-subcategory filters. */
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  /** Filter providers that have this user as a provider admin */
  @IsOptional()
  @IsUUID()
  adminUserId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(ProviderApprovalStatus)
  approvalStatus?: ProviderApprovalStatus;

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  /** Search radius in kilometers (requires latitude + longitude) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
