import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Backend guard that restricts access to verified female users only.
 * Must be used AFTER JwtAuthGuard.
 * 
 * Enforced at the API layer so someone can't bypass frontend guards
 * by calling the API directly. This is security-critical.
 */
@Injectable()
export class WomenOnlyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true, isVerified: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.gender !== 'FEMALE') {
      throw new ForbiddenException('This feature is restricted to women users');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('ID verification required to access women-only features');
    }

    return true;
  }
}
