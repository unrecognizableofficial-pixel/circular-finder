import Redis from "ioredis";
import { Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostStatus, RoleKey } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import type { RequestUser } from "@/common/interfaces/request-user.interface";
import { CreateCommentDto } from "@/modules/social/dto/create-comment.dto";
import { CreatePostDto } from "@/modules/social/dto/create-post.dto";

@Injectable()
export class SocialService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.redis = new Redis(this.configService.getOrThrow<string>("redis.url"), {
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => undefined);
  }

  async createPost(user: RequestUser, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId: user.sub,
        title: dto.title,
        caption: dto.caption,
        autoCaption: dto.autoCaption,
        cta: dto.cta,
        brandId: dto.brandId,
        subBrandId: dto.subBrandId,
        mediaAssetId: dto.mediaAssetId,
        circularIdId: dto.circularIdId,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
    await this.redis.del("feed:trending").catch(() => undefined);
    return post;
  }

  async deletePost(postId: string, user: RequestUser) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException("Post not found.");
    }
    if (post.authorId !== user.sub && user.role !== RoleKey.MASTER_BRAND_ADMIN) {
      throw new NotFoundException("Post not found.");
    }
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.REMOVED,
        deletedAt: new Date()
      }
    });
  }

  async like(postId: string, user: RequestUser) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.sub
        }
      }
    });

    if (existingLike) {
      return this.prisma.post.findUnique({ where: { id: postId } });
    }

    await this.prisma.like.create({
      data: {
        postId,
        userId: user.sub
      }
    });

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          increment: 1
        },
        engagementScore: {
          increment: 2
        }
      }
    });
  }

  async save(postId: string, user: RequestUser) {
    const existingSave = await this.prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.sub
        }
      }
    });

    if (existingSave) {
      return this.prisma.post.findUnique({ where: { id: postId } });
    }

    await this.prisma.savedPost.create({
      data: {
        postId,
        userId: user.sub
      }
    });

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        saveCount: { increment: 1 }
      }
    });
  }

  async share(postId: string, user: RequestUser, channel = "feed") {
    await this.prisma.postShare.create({
      data: {
        postId,
        userId: user.sub,
        channel
      }
    });

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        shareCount: { increment: 1 },
        engagementScore: { increment: 3 }
      }
    });
  }

  async comment(postId: string, user: RequestUser, dto: CreateCommentDto) {
    await this.prisma.comment.create({
      data: {
        postId,
        authorId: user.sub,
        body: dto.body
      }
    });

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: { increment: 1 },
        engagementScore: { increment: 2 }
      }
    });
  }

  async follow(targetUserId: string, user: RequestUser) {
    const existingFollow = await this.prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.sub,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      return { success: true, alreadyFollowing: true };
    }

    await this.prisma.$transaction([
      this.prisma.follower.create({
        data: {
          followerId: user.sub,
          followingId: targetUserId
        }
      }),
      this.prisma.profile.updateMany({
        where: { userId: targetUserId },
        data: {
          followersCount: { increment: 1 }
        }
      })
    ]);

    return { success: true, alreadyFollowing: false };
  }

  async unfollow(targetUserId: string, user: RequestUser) {
    const deleted = await this.prisma.follower.deleteMany({
      where: {
        followerId: user.sub,
        followingId: targetUserId
      }
    });

    if (deleted.count > 0) {
      await this.prisma.profile.updateMany({
        where: { userId: targetUserId },
        data: {
          followersCount: { decrement: deleted.count }
        }
      });
    }

    return { success: true };
  }

  async relationships(user: RequestUser) {
    const [followers, following] = await Promise.all([
      this.prisma.follower.findMany({
        where: { followingId: user.sub },
        include: { follower: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        take: 25
      }),
      this.prisma.follower.findMany({
        where: { followerId: user.sub },
        include: { following: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
        take: 25
      })
    ]);

    return {
      followers,
      following
    };
  }

  async personalizedFeed(user: RequestUser) {
    const following = await this.prisma.follower.findMany({
      where: { followerId: user.sub },
      select: { followingId: true }
    });

    return this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        authorId: { in: following.map((row) => row.followingId) }
      },
      include: {
        author: { include: { profile: true } },
        circularId: true
      },
      orderBy: [{ publishedAt: "desc" }, { engagementScore: "desc" }],
      take: 25
    });
  }

  async trendingFeed() {
    const cacheKey = "feed:trending";
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) {
      return JSON.parse(cached);
    }

    const posts = await this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: {
        author: { include: { profile: true } },
        circularId: true
      },
      orderBy: [{ engagementScore: "desc" }, { publishedAt: "desc" }],
      take: 25
    });
    await this.redis.set(cacheKey, JSON.stringify(posts), "EX", 60).catch(() => undefined);
    return posts;
  }

  suggestedFeed() {
    return this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: {
        author: { include: { profile: true } },
        circularId: true
      },
      orderBy: [{ shareCount: "desc" }, { saveCount: "desc" }, { publishedAt: "desc" }],
      take: 25
    });
  }

  suggestedFollows() {
    return this.prisma.profile.findMany({
      where: { verified: true },
      orderBy: [{ reputationScore: "desc" }, { followersCount: "desc" }],
      take: 12
    });
  }
}
