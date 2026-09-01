import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EnquiryStatus } from '@prisma/client';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class CreateEnquiryDto {
  @IsString()
  category!: string;

  @IsString()
  subCategory!: string;

  @IsString()
  product!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  marketplaceProductId?: string;

  @IsString()
  date!: string;

  @IsString()
  createdBy!: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  stateId?: string;
}

export class UpdateEnquiryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  product?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  stateId?: string;
}

export class ListEnquiriesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;
}
