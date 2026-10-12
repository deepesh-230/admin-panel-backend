import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class NotifyChatDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  preview!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
