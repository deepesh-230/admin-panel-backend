import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRazorpayOrderDto {
  /** Plan code: silver | gold | platinum */
  @IsString()
  @MaxLength(50)
  planId!: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  payerEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  payerPhone?: string;

  /** Optional note from the payer (shown in admin payments list). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  payerNote?: string;
}

export class VerifyRazorpayPaymentDto {
  @IsString()
  @MaxLength(200)
  razorpayOrderId!: string;

  @IsString()
  @MaxLength(200)
  razorpayPaymentId!: string;

  @IsString()
  @MaxLength(500)
  razorpaySignature!: string;
}

export class MarkRazorpayFailedDto {
  @IsString()
  @MaxLength(200)
  razorpayOrderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
