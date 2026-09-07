import { IsOptional, IsString, MinLength } from 'class-validator';

export class AutocompleteQueryDto {
  @IsString()
  @MinLength(2)
  q!: string;
}

export class DetailsQueryDto {
  @IsString()
  @MinLength(1)
  placeId!: string;

  @IsOptional()
  @IsString()
  fallback?: string;
}
