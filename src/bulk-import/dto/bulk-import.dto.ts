import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { BULK_IMPORT_ENTITIES } from '../bulk-import.types';

export class BulkImportDto {
  @IsIn([...BULK_IMPORT_ENTITIES])
  entity!: (typeof BULK_IMPORT_ENTITIES)[number];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  rows!: Record<string, string>[];

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subcategoryId?: string;
}
