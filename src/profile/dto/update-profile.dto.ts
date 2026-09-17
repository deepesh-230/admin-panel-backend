import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AgeRange } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string | null;

  @IsOptional()
  @IsString()
  stateName?: string;

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
  @IsNumber()
  @Min(1)
  @Max(100)
  km?: number;

  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  disabilitySubcategoryIds?: string[];
}
