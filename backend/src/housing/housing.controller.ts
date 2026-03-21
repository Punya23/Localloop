import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { HousingService } from './housing.service';
import { CreateHousingDto, HousingFilterDto, CreateReviewDto } from './dto/housing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Housing')
@Controller('housing')
export class HousingController {
  constructor(private housingService: HousingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all housing listings with filters' })
  findAll(@Query() filters: HousingFilterDto) {
    return this.housingService.findAll(filters);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved housing listings' })
  getSaved(@Request() req: any) {
    return this.housingService.getSavedHousings(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get housing listing by ID' })
  findOne(@Param('id') id: string) {
    return this.housingService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new housing listing' })
  create(@Request() req: any, @Body() dto: CreateHousingDto) {
    return this.housingService.create(req.user.sub, dto);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add review to housing listing' })
  createReview(@Request() req: any, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return this.housingService.createReview(req.user.sub, id, dto);
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle save housing listing' })
  saveHousing(@Request() req: any, @Param('id') id: string) {
    return this.housingService.saveHousing(req.user.sub, id);
  }
}
