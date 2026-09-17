import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AgeRange, CategoryType, RoleName } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(RoleName)
  role!: RoleName;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  disabilitySubcategoryIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @IsOptional()
  @IsUUID()
  stateId?: string | null;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  disabilitySubcategoryIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** Dedicated name filter (also covered by search). */
  @IsOptional()
  @IsString()
  name?: string;

  /** One id or comma-separated ids for multi-state filters. */
  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  /** CARE = Service, SERVICE = Emergency Service (via assigned providers). */
  @IsOptional()
  @IsEnum(CategoryType)
  categoryType?: CategoryType;

  /** Disability category ids (comma-separated). */
  @IsOptional()
  @IsString()
  categoryId?: string;

  /** Disability subcategory ids (comma-separated). */
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @IsOptional()
  @IsString()
  createdFrom?: string;

  @IsOptional()
  @IsString()
  createdTo?: string;

  @IsOptional()
  @IsString()
  isActive?: string;

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
