import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { OnboardingDto, UpdateProfileDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('onboarding')
  @ApiOperation({ summary: 'Complete user onboarding' })
  completeOnboarding(@Request() req: any, @Body() dto: OnboardingDto) {
    return this.usersService.completeOnboarding(req.user.sub, dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get personalized dashboard data' })
  getDashboard(@Request() req: any) {
    return this.usersService.getDashboard(req.user.sub);
  }
}
