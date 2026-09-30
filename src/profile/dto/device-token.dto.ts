import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @MinLength(10)
  token!: string;

  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform!: string;
}

export class RemoveDeviceTokenDto {
  @IsOptional()
  @IsString()
  token?: string;
}
