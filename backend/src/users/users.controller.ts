import { Controller, Post, Get, Patch, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { OnboardingDto, UpdateProfileDto, UploadIdProofDto } from './dto/users.dto';
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

  @Post('verify/upload')
  @ApiOperation({ summary: 'Upload ID proof for verification' })
  uploadIdProof(@Request() req: any, @Body() dto: UploadIdProofDto) {
    return this.usersService.uploadIdProof(req.user.sub, dto);
  }

  @Get('verify/status')
  @ApiOperation({ summary: 'Get verification status' })
  getVerificationStatus(@Request() req: any) {
    return this.usersService.getVerificationStatus(req.user.sub);
  }

  // ════════════ FIND PEOPLE ════════════

  @Get('search')
  @ApiOperation({ summary: 'Search onboarded users (Find People)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'interests', required: false, description: 'Comma-separated interests' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, university, company' })
  searchUsers(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('city') city?: string,
    @Query('role') role?: string,
    @Query('gender') gender?: string,
    @Query('interests') interests?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.searchUsers(
      req.user.sub,
      page || 1,
      limit || 20,
      { city, role, gender, interests, search },
    );
  }

  // ════════════ HOUSING INQUIRY ════════════

  @Post('housing-inquiry/:housingId')
  @ApiOperation({ summary: 'Send housing inquiry (routes to owner + admin)' })
  sendHousingInquiry(
    @Request() req: any,
    @Param('housingId') housingId: string,
    @Body() body: { message: string },
  ) {
    return this.usersService.sendHousingInquiry(req.user.sub, housingId, body.message);
  }

  // ════════════ MENTOR APPLICATION ════════════

  @Post('mentor/apply')
  @ApiOperation({ summary: 'Apply for mentor program' })
  applyForMentor(@Request() req: any, @Body() body: { expertise: string[], experience: string, availability: string }) {
    return this.usersService.applyForMentor(req.user.sub, body);
  }

  // ════════════ NOTIFICATIONS ════════════

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  getNotifications(@Request() req: any) {
    return this.usersService.getNotifications(req.user.sub);
  }

  @Patch('notifications/read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markNotificationsRead(@Request() req: any) {
    return this.usersService.markNotificationsRead(req.user.sub);
  }
}
