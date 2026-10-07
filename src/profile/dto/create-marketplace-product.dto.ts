import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function toOptionalNumber({ value }: { value: unknown }): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export class CreateMarketplaceProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  actualPrice?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  offerPrice?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['sell', 'buy', 'SELL', 'BUY'])
  listingIntent?: string;

  @IsOptional()
  @IsString()
  @IsIn(['NEW', 'USED', 'FREE', 'new', 'used', 'free'])
  condition?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  features?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

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
  @IsIn(['NATIONAL', 'STATE', 'LOCAL'])
  coverageFlag?: string;

  @IsOptional()
  @IsString()
  coverageStateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  coverageCity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];
}

export class UpdateMarketplaceProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  actualPrice?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  offerPrice?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(['sell', 'buy', 'SELL', 'BUY'])
  listingIntent?: string;

  @IsOptional()
  @IsString()
  @IsIn(['NEW', 'USED', 'FREE', 'new', 'used', 'free'])
  condition?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  color?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brand?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  features?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  /** Soft deactivate / reactivate own sale listing. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListMarketplacePublicQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['NEW', 'USED', 'FREE', 'new', 'used', 'free'])
  condition?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radius?: number;

  @IsOptional()
  @IsString()
  @IsIn(['sell', 'buy', 'SELL', 'BUY'])
  listingIntent?: string;
}
