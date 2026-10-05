import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateStateAdminDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
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

  /** Legacy single-state field; prefer stateIds. */
  @IsOptional()
  @IsUUID()
  stateId?: string;

  @ValidateIf((o: CreateStateAdminDto) => !o.stateId)
  @IsArray()
  @ArrayMinSize(1, { message: 'Assign at least one state' })
  @IsUUID(undefined, { each: true })
  stateIds?: string[];
}

export class UpdateStateAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Assign at least one state' })
  @IsUUID(undefined, { each: true })
  stateIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
