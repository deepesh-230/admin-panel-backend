import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePublicHelpTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}
