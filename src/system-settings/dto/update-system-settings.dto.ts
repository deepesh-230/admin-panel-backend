import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SystemSettingUpdateItemDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class UpdateSystemSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SystemSettingUpdateItemDto)
  settings!: SystemSettingUpdateItemDto[];
}
