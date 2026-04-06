import { IsString, IsInt, IsOptional, IsEnum, IsBoolean, IsArray, Min, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum HousingType {
  PG = 'PG',
  HOSTEL = 'HOSTEL',
  FLAT = 'FLAT',
  SHARED_ROOM = 'SHARED_ROOM',
  SINGLE_ROOM = 'SINGLE_ROOM',
}

enum GenderPreference {
  MALE_ONLY = 'MALE_ONLY',
  FEMALE_ONLY = 'FEMALE_ONLY',
  CO_ED = 'CO_ED',
  ANY = 'ANY',
}

export class CreateHousingDto {
  @ApiProperty({ example: 'Cozy PG near MIT College' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Fully furnished PG with WiFi and meals' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Kothrud, Pune' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Kothrud' })
  @IsString()
  area: string;

  @ApiProperty({ example: 8000 })
  @IsInt()
  @Min(0)
  rent: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsInt()
  @IsOptional()
  deposit?: number;

  @ApiProperty({ enum: HousingType })
  @IsEnum(HousingType)
  type: HousingType;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsEnum(GenderPreference)
  @IsOptional()
  genderPreference?: GenderPreference;

  @ApiPropertyOptional({ example: ['WiFi', 'AC', 'Meals'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isWomenFriendly?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;
}

export class HousingFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  area?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  budgetMin?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  budgetMax?: number;

  @ApiPropertyOptional({ enum: HousingType })
  @IsEnum(HousingType)
  @IsOptional()
  type?: HousingType;

  @ApiPropertyOptional({ enum: GenderPreference })
  @IsEnum(GenderPreference)
  @IsOptional()
  genderPreference?: GenderPreference;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isWomenFriendly?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit?: number;
}

export class CreateReviewDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  rating: number;

  @ApiProperty({ example: 'Great place! Clean rooms and friendly staff.' })
  @IsString()
  review: string;
}
