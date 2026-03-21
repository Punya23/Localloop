import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSIONAL = 'PROFESSIONAL',
  INTERN = 'INTERN',
}

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export class OnboardingDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredArea?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  moveMonth?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Max(100000)
  @IsOptional()
  budgetMax?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isWomenMode?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  university?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredArea?: string;
}
