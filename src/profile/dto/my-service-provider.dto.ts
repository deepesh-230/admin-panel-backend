import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** End-user create/update payload for "my service providers". */
export class CreateMyServiceProviderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

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

  /** Free-text location label from Places autocomplete (used to infer state). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationLabel?: string;
}

export class UpdateMyServiceProviderDto {
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
  coverPhotoUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationLabel?: string;
}
