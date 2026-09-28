import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentPurpose, PaymentStatus } from '@prisma/client';

export class ListPaymentsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentPurpose)
  purpose?: PaymentPurpose;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  /** Plan code: silver | gold | platinum (diamond treated as platinum). */
  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  stateId?: string;

  /** Sponsorship validity: active = not expired; inactive = validUntil in the past. */
  @IsOptional()
  @IsIn(['active', 'inactive'])
  validity?: 'active' | 'inactive';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreatePaymentDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerName?: string;

  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  payerPhone?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentPurpose)
  purpose?: PaymentPurpose;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  planId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gateway?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  paymentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Optional note from the payer (shown in admin payments list). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  payerNote?: string;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerName?: string;

  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  payerPhone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentPurpose)
  purpose?: PaymentPurpose;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  planId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gateway?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  paymentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  payerNote?: string | null;

  @IsOptional()
  @IsDateString()
  paidAt?: string | null;
}
