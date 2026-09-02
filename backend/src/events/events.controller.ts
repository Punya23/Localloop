import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheControl } from '../common/cache/http-cache.interceptor';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get all events' })
  findAll(@Query('upcoming') upcoming?: boolean) {
    return this.eventsService.findAll(upcoming !== false);
  }

  @Get(':id')
  @CacheControl({ maxAge: 60, staleWhileRevalidate: 300 })
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create event' })
  create(@Request() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.sub, dto);
  }

  @Post(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attend an event' })
  attend(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.attend(req.user.sub, id);
  }

  @Delete(':id/attend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel event attendance' })
  cancelAttendance(@Request() req: any, @Param('id') id: string) {
    return this.eventsService.cancelAttendance(req.user.sub, id);
  }
}
