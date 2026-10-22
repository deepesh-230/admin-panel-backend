import { HelpTicketStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateHelpTicketDto {
  @IsOptional()
  @IsEnum(HelpTicketStatus)
  status?: HelpTicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reply?: string;
}
