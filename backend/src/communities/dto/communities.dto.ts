import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum CommunityType {
  UNIVERSITY = 'UNIVERSITY',
  PROFESSIONAL = 'PROFESSIONAL',
  HOMETOWN = 'HOMETOWN',
  NEWCOMER_BATCH = 'NEWCOMER_BATCH',
  WOMEN_ONLY = 'WOMEN_ONLY',
  GENERAL = 'GENERAL',
}

export class CreateCommunityDto {
  @ApiProperty({ example: 'PCU Students 2024' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Community for PCU students relocating to Pune' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CommunityType })
  @IsEnum(CommunityType)
  type: CommunityType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isWomenOnly?: boolean;
}
