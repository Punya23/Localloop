import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        location: dto.location,
        maxAttendees: dto.maxAttendees,
        communityId: dto.communityId,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true } },
        _count: { select: { attendees: true } },
      },
    });
  }

  async findAll(upcoming: boolean = true) {
    return this.prisma.event.findMany({
      where: upcoming ? { date: { gte: new Date() } } : {},
      orderBy: { date: 'asc' },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true } },
        _count: { select: { attendees: true } },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true } },
        attendees: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        _count: { select: { attendees: true } },
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async attend(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendees: true } } },
    });

    if (!event) throw new NotFoundException('Event not found');

    if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }

    const existing = await this.prisma.eventAttendee.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      throw new ConflictException('Already attending this event');
    }

    await this.prisma.eventAttendee.create({
      data: { userId, eventId },
    });

    return { message: 'Registered for event successfully' };
  }

  async cancelAttendance(userId: string, eventId: string) {
    const attendance = await this.prisma.eventAttendee.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!attendance) {
      throw new NotFoundException('Not registered for this event');
    }

    await this.prisma.eventAttendee.delete({
      where: { id: attendance.id },
    });

    return { message: 'Cancelled attendance' };
  }
}
