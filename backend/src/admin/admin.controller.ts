import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ── Dashboard Stats ──
  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getDashboardStats(@Request() req: any) {
    return this.adminService.getDashboardStats(req.user.sub);
  }

  // ── User Management ──
  @Get('users')
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllUsers(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(req.user.sub, page || 1, limit || 20, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail' })
  getUserDetail(@Request() req: any, @Param('id') id: string) {
    return this.adminService.getUserDetail(req.user.sub, id);
  }

  // ── Verification ──
  @Get('verifications/pending')
  @ApiOperation({ summary: 'Get pending verification requests' })
  getPendingVerifications(@Request() req: any) {
    return this.adminService.getPendingVerifications(req.user.sub);
  }

  @Patch('verifications/:userId')
  @ApiOperation({ summary: 'Approve or reject user verification' })
  verifyUser(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() body: { approved: boolean; notes?: string },
  ) {
    return this.adminService.verifyUser(req.user.sub, userId, body.approved, body.notes);
  }

  // ── Housing Management ──
  @Get('housings')
  @ApiOperation({ summary: 'Get all housings (admin)' })
  getAllHousings(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllHousings(req.user.sub, page || 1, limit || 20);
  }

  @Patch('housings/:id/verify')
  @ApiOperation({ summary: 'Verify/unverify a housing listing' })
  verifyHousing(@Request() req: any, @Param('id') id: string, @Body() body: { verified: boolean }) {
    return this.adminService.verifyHousing(req.user.sub, id, body.verified);
  }

  @Post('housings')
  @ApiOperation({ summary: 'Admin create housing (auto-verified)' })
  createHousing(@Request() req: any, @Body() body: any) {
    return this.adminService.adminCreateHousing(req.user.sub, body);
  }

  @Patch('housings/:id')
  @ApiOperation({ summary: 'Admin update housing' })
  updateHousing(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.adminService.updateHousing(req.user.sub, id, body);
  }

  @Delete('housings/:id')
  @ApiOperation({ summary: 'Admin delete housing' })
  deleteHousing(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteHousing(req.user.sub, id);
  }

  // ── Mentor Management ──
  @Get('mentors/pending')
  @ApiOperation({ summary: 'Get pending mentor applications' })
  getPendingMentors(@Request() req: any) {
    return this.adminService.getPendingMentors(req.user.sub);
  }

  @Patch('mentors/:profileId')
  @ApiOperation({ summary: 'Approve or reject mentor application' })
  approveMentor(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() body: { approved: boolean },
  ) {
    return this.adminService.approveMentor(req.user.sub, profileId, body.approved);
  }

  // ── Admin Promotion ──
  @Patch('users/:id/make-admin')
  @ApiOperation({ summary: 'Promote user to admin' })
  makeAdmin(@Request() req: any, @Param('id') id: string) {
    return this.adminService.makeAdmin(req.user.sub, id);
  }

  // ── Messages (Inquiries) ──
  @Get('messages')
  @ApiOperation({ summary: 'Get admin messages/inquiries' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMessages(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getMessages(req.user.sub, page || 1, limit || 20);
  }

  // ── Communities ──
  @Get('communities')
  @ApiOperation({ summary: 'Get all communities (paginated)' })
  getAllCommunities(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllCommunities(req.user.sub, page || 1, limit || 20);
  }

  @Delete('communities/:id')
  @ApiOperation({ summary: 'Admin delete a community' })
  deleteCommunity(@Request() req: any, @Param('id') id: string) {
    return this.adminService.deleteCommunity(req.user.sub, id);
  }

  // ── Push Notifications ──
  @Post('push-notification')
  @ApiOperation({ summary: 'Broadcast push notification to users' })
  sendPushNotification(@Request() req: any, @Body() body: { title: string; message: string }) {
    return this.adminService.sendPushNotification(req.user.sub, body.title, body.message);
  }

  // ── User Bans ──
  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban or unban user' })
  banUser(@Request() req: any, @Param('id') id: string) {
    return this.adminService.toggleBanUser(req.user.sub, id);
  }
}
