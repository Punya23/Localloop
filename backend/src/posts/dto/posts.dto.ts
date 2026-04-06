import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Looking for roommate near Hinjewadi!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'community-id-here' })
  @IsString()
  communityId: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ example: 'I know a great place! DM me.' })
  @IsString()
  content: string;
}
