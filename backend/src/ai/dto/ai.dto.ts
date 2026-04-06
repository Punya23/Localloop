import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  message: string;
}

export class TrackViewDto {
  @ApiProperty()
  @IsString()
  housingId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
