import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReputationService } from '../reputation/reputation.service';
import { CreatePostDto, CreateCommentDto } from './dto/posts.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService, private reputationService: ReputationService) {}

  async create(userId: string, dto: CreatePostDto) {
    // Verify user is a member of the community
    const membership = await this.prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId: dto.communityId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must join the community before posting');
    }

    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        images: dto.images || [],
        communityId: dto.communityId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    // Award reputation points for posting
    await this.reputationService.addPoints(userId, 5, 'Post created');

    // Update community post count
    await this.prisma.community.update({
      where: { id: dto.communityId },
      data: { updatedAt: new Date() },
    });

    return post;
  }

  async getFeed(userId: string) {
    // get communities the user is in
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });
    const joinedIds = memberships.map(m => m.communityId);

    // If no communities joined, return some popular posts globally or an empty array
    // Let's just return global latest posts if joinedIds is empty, or only from joined
    let whereClause = {};
    if (joinedIds.length > 0) {
      whereClause = { communityId: { in: joinedIds } };
    }

    const posts = await this.prisma.post.findMany({
      where: whereClause,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });
    return posts;
  }

  async findByCommunity(communityId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { communityId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true, isMentor: true } },
          community: { select: { id: true, name: true } },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, name: true, avatar: true, isMentor: true } },
            },
          },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count({ where: { communityId } }),
    ]);

    return {
      data: posts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, isMentor: true } },
      },
    });

    // Update comment count
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    // Award reputation points for commenting
    await this.reputationService.addPoints(userId, 7, 'Comment added');

    return comment;
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, avatar: true, isMentor: true } },
      },
    });
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Cannot delete other user\'s post');

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }
}
