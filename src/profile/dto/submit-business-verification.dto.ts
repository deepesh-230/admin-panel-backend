import { IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

/** At least one ID must be non-empty (enforced in service). */
export class SubmitBusinessVerificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mcaId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  din?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i, {
    message: 'Invalid GSTIN format',
  })
  @MaxLength(15)
  gstin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nmcId?: string;

  @IsOptional()
  @ValidateIf((_, v) => v != null && String(v).trim() !== '')
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, {
    message: 'Invalid PAN format',
  })
  @MaxLength(10)
  panId?: string;
}
