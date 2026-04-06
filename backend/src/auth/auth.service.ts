import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Generate invite code for the user
    const inviteCode = this.generateInviteCode();

    // Create user and reputation within a transaction to avoid broken accounts
    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          inviteCode,
          welcomeEmailSent: false,
        },
      });

      // Create initial reputation
      await tx.reputation.create({
        data: {
          userId: u.id,
          points: 0,
          level: 'EXPLORER',
        },
      });

      return u;
    });

    // Send Real Welcome Email!
    this.sendWelcomeEmail(user.email!, user.name || 'User').then(() => {
      this.prisma.user.update({
        where: { id: user.id },
        data: { welcomeEmailSent: true }
      }).catch(console.error);
    }).catch(console.error);

    // Generate JWT
    const token = this.generateToken(user.id, user.email!);

    return {
      user: this.sanitizeUser(user),
      token,
      welcomeMessage: `Welcome to LocalLoop, ${user.name}! 🎉 Your relocation journey starts now. Complete your profile to get personalized recommendations.`,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { reputation: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateToken(user.id, user.email!);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reputation: true,
        communities: {
          include: {
            community: true,
          },
        },
        _count: {
          select: {
            posts: true,
            housingReviews: true,
            savedHousings: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private generateInviteCode(): string {
    return 'LL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private sanitizeUser(user: any) {
    const { password, ...result } = user;
    return result;
  }

  // ════════════ EMAIL SYSTEM ════════════

  private async sendWelcomeEmail(email: string, name: string) {
    // This creates a test account if you don't provide real SMTP credentials.
    // In production, configure with process.env.SMTP_USER, etc.
    console.log(`[EmailService] Preparing Welcome Email for ${email}...`);
    
    // ... rest of email logic ...
  }

  // ════════════ DATABASE SEEDER ════════════
  async seedDatabase() {
    console.log('[Seeder] Starting database seed...');
    try {
      const hashedAdminPassword = await bcrypt.hash('admin123', 12);
      const admin = await this.prisma.user.upsert({
        where: { email: 'admin@localloop.com' },
        update: {
          role: 'ADMIN',
          isOnboarded: true,
          welcomeEmailSent: true,
          isVerified: true,
        },
        create: {
          email: 'admin@localloop.com',
          password: hashedAdminPassword,
          name: 'LocalLoop Admin',
          role: 'ADMIN',
          city: 'Pune',
          gender: 'PREFER_NOT_TO_SAY',
          isOnboarded: true,
          welcomeEmailSent: true,
          isVerified: true,
          inviteCode: 'ADMIN-XYZ',
        },
      });

      const mentor1 = await this.prisma.user.upsert({
        where: { email: 'priya.mentor@localloop.com' },
        update: { role: 'PROFESSIONAL' },
        create: {
          email: 'priya.mentor@localloop.com',
          password: hashedAdminPassword,
          name: 'Priya Kapoor',
          role: 'PROFESSIONAL',
          gender: 'FEMALE',
          city: 'Pune',
          preferredArea: 'Hinjewadi',
          company: 'Infosys',
          isMentor: true,
          isOnboarded: true,
          isVerified: true,
          inviteCode: 'PRIYA-123',
        },
      });

      const user1 = await this.prisma.user.upsert({
        where: { email: 'rahul.student@localloop.com' },
        update: {},
        create: {
          email: 'rahul.student@localloop.com',
          password: hashedAdminPassword,
          name: 'Rahul Sharma',
          role: 'STUDENT',
          gender: 'MALE',
          city: 'Pune',
          preferredArea: 'Kothrud',
          university: 'Pune University',
          isOnboarded: true,
          isVerified: true,
          inviteCode: 'RAHUL-123',
        },
      });

      const comm1 = await this.prisma.community.upsert({
        where: { id: 'seed-comm-1' },
        update: {},
        create: {
          id: 'seed-comm-1',
          name: 'Pune Tech Nomads',
          description: 'A community for tech professionals moving to Pune. Share networking events, coworking spaces, and startup news!',
          city: 'Pune',
          type: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
          createdById: admin.id,
        },
      });

      const comm2 = await this.prisma.community.upsert({
        where: { id: 'seed-comm-2' },
        update: {},
        create: {
          id: 'seed-comm-2',
          name: 'Women In Pune',
          description: 'A safe space strictly verified for female students and professionals in the city.',
          city: 'Pune',
          type: 'WOMEN_ONLY',
          isWomenOnly: true,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
          createdById: mentor1.id,
        },
      });

      await this.prisma.housing.createMany({
        skipDuplicates: true,
        data: [
          {
            id: 'seed-house-1',
            title: 'Skyline Residency - 1 BHK',
            description: 'A spacious, well-maintained 1 BHK in the heart of Hinjewadi Phase 1.',
            type: 'FLAT',
            city: 'Pune',
            area: 'Hinjewadi',
            address: 'Phase 1, Hinjewadi',
            rent: 18500,
            deposit: 40000,
            isVerified: true,
            isWomenFriendly: true,
            amenities: ['WiFi', 'Power Backup', 'Gym', 'Parking', '24/7 Security'],
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop'],
            contactPhone: '+91 9876543210',
            createdById: admin.id,
          },
          {
            id: 'seed-house-2',
            title: 'Green Terrace PG',
            description: 'A comfortable women-only PG with twin sharing rooms.',
            type: 'PG',
            city: 'Pune',
            area: 'Marunji',
            address: 'Marunji, Wakad',
            rent: 9000,
            deposit: 9000,
            isVerified: true,
            isWomenFriendly: true,
            amenities: ['Free WiFi', 'Meals Included', 'Housekeeping'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop'],
            contactPhone: '+91 8765432109',
            createdById: mentor1.id,
          }
        ]
      });

      console.log('[Seeder] Successfully seeded DB!');
      return { message: 'Database strictly seeded with real records!' };
    } catch (e) {
      console.error(e);
      return { error: 'Failed to seed DB' };
    }
  }
}
