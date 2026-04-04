import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsArray, Min, Max } from 'class-validator';
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

  // ── ML-Ready Extended Fields ──

  @ApiPropertyOptional({ description: 'Interests/hobbies for friend matching', example: ['fitness', 'gaming', 'travel'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @ApiPropertyOptional({ description: 'Food preference', example: 'veg' })
  @IsString()
  @IsOptional()
  foodPreference?: string;

  @ApiPropertyOptional({ description: 'Work schedule', example: 'day' })
  @IsString()
  @IsOptional()
  workSchedule?: string;

  @ApiPropertyOptional({ description: 'Languages spoken', example: ['English', 'Hindi'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @ApiPropertyOptional({ description: 'Lifestyle type', example: 'early_bird' })
  @IsString()
  @IsOptional()
  lifestyle?: string;

  @ApiPropertyOptional({ description: 'Transport mode', example: 'public' })
  @IsString()
  @IsOptional()
  transportMode?: string;

  @ApiPropertyOptional({ description: 'Smoking habit', example: 'no' })
  @IsString()
  @IsOptional()
  smoking?: string;

  @ApiPropertyOptional({ description: 'Drinking habit', example: 'occasionally' })
  @IsString()
  @IsOptional()
  drinking?: string;

  @ApiPropertyOptional({ description: 'Pet friendly' })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiPropertyOptional({ description: 'Age range', example: '18-22' })
  @IsString()
  @IsOptional()
  ageRange?: string;

  @ApiPropertyOptional({ description: 'Hometown for community matching' })
  @IsString()
  @IsOptional()
  hometown?: string;

  @ApiPropertyOptional({ description: 'Course or department for student matching' })
  @IsString()
  @IsOptional()
  courseOrDept?: string;

  @ApiPropertyOptional({ description: 'Monthly income bracket' })
  @IsString()
  @IsOptional()
  monthlyIncome?: string;
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

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isWomenMode?: boolean;
}

export class UploadIdProofDto {
  @ApiProperty({ description: 'URL of uploaded ID proof image' })
  @IsString()
  idProofUrl: string;

  @ApiProperty({ description: 'Type of ID proof', example: 'aadhaar' })
  @IsString()
  idProofType: string;
}
