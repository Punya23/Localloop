import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum EventType {
  MEETUP = 'MEETUP',
  STUDY_GROUP = 'STUDY_GROUP',
  NETWORKING = 'NETWORKING',
  CITY_EXPLORATION = 'CITY_EXPLORATION',
  WORKSHOP = 'WORKSHOP',
  WELCOME = 'WELCOME',
}

export class CreateEventDto {
  @ApiProperty({ example: 'Welcome Meetup for March Batch' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Meet fellow newcomers in Pune!' })
  @IsString()
  description: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '2024-04-01T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2024-04-01T12:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 'FC Road, Pune' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttendees?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  communityId?: string;
}
