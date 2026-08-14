import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateKeywordDto {
  @IsUUID()
  subcategoryId!: string;

  @IsString()
  term!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateKeywordDto {
  @IsOptional()
  @IsString()
  term?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;
}
