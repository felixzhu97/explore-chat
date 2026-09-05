import { Injectable, BadRequestException } from "@nestjs/common";
import compact from "lodash/compact";
import keyBy from "lodash/keyBy";
import orderBy from "lodash/orderBy";
import uniq from "lodash/uniq";
import { PrismaService } from "@/core/database/prisma.service";
import { RedisService } from "@/core/database/redis.service";

const RECOMMENDATION_KEY_PREFIX = "recommendation:user:";

export interface SuggestedUserDto {
  id: string;
  username: string;
  avatar: string | null;
  description: string;
}

export interface FollowUserDto {
  id: string;
  username: string;
  avatar: string | null;
  isFollowing?: boolean;
}

export interface FollowListResult {
  list: FollowUserDto[];
  total: number;
  pageState?: string;
}

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId)
      throw new BadRequestException("Cannot follow self");
    await this.prisma.userFollow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });
    return { followerId, followingId, isFollowing: true };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.prisma.userFollow.deleteMany({
      where: { followerId, followingId },
    });
    return { followerId, followingId, isFollowing: false };
  }

  async checkFollowing(
    followerId: string,
    followingIds: string[],
  ): Promise<Set<string>> {
    if (!Array.isArray(followingIds) || followingIds.length === 0)
      return new Set();
    const unique = uniq(
      compact(
        followingIds
          .map((id) => id?.toString())
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0 && id !== followerId,
          ),
      ),
    );
    if (unique.length === 0) return new Set();
    const rels = await this.prisma.userFollow.findMany({
      where: {
        followerId,
        followingId: { in: unique },
      },
      select: { followingId: true },
    });
    return new Set(rels.map((r) => r.followingId));
  }

  async getSuggestions(
    currentUserId: string,
    limit: number = 10,
  ): Promise<SuggestedUserDto[]> {
    const cached = await this.redis.get<string[]>(
      `${RECOMMENDATION_KEY_PREFIX}${currentUserId}`,
    );
    if (Array.isArray(cached) && cached.length > 0) {
      const ids = cached.slice(0, limit);
      const users = await this.prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true, avatar: true },
      });
      const orderMap = keyBy(
        ids.map((id, index) => ({ id, index })),
        "id",
      );
      const sorted = orderBy(
        users,
        (user) => orderMap[user.id]?.index ?? 999,
        "asc",
      );
      return sorted.map((u) => ({
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        description: "Suggested for you",
      }));
    }

    const FOLLOWING_CAP = 500;
    const followingIds = await this.prisma.userFollow
      .findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
        take: FOLLOWING_CAP,
      })
      .then((rows) => rows.map((r) => r.followingId));

    const alreadyFollowing = new Set(followingIds);
    alreadyFollowing.add(currentUserId);

    const friendOfFriendRaw = await this.prisma.userFollow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: { notIn: [...alreadyFollowing] },
      },
      select: { followingId: true, followerId: true },
    });

    const countByUser = friendOfFriendRaw.reduce((acc, row) => {
      if (alreadyFollowing.has(row.followingId)) return acc;
      const list = acc.get(row.followingId) ?? [];
      list.push(row.followerId);
      acc.set(row.followingId, list);
      return acc;
    }, new Map<string, string[]>());

    const userIdsFromFoF = Array.from(countByUser.keys());
    const fofUsers = await this.prisma.user.findMany({
      where: { id: { in: userIdsFromFoF } },
      select: { id: true, username: true, avatar: true },
    });

    const fofWithDesc: SuggestedUserDto[] = fofUsers.map((u) => {
      const followerIds = countByUser.get(u.id) ?? [];
      const desc =
        followerIds.length > 1
          ? `Followed by ${followerIds.length} people you follow`
          : "Followed by someone you follow";
      return {
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        description: desc,
      };
    });

    const sortedFof = orderBy(
      fofWithDesc,
      (user) => (countByUser.get(user.id) ?? []).length,
      "desc",
    );

    const taken = new Set(sortedFof.map((u) => u.id));
    if (sortedFof.length >= limit) {
      return sortedFof.slice(0, limit);
    }

    const need = limit - sortedFof.length;
    const rest = await this.prisma.user.findMany({
      where: {
        id: { notIn: [...taken, currentUserId, ...followingIds] },
      },
      select: { id: true, username: true, avatar: true },
      take: need * 2,
      orderBy: { createdAt: "desc" },
    });

    const suggested: SuggestedUserDto[] = rest.slice(0, need).map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      description: "Suggested for you",
    }));

    return [...sortedFof, ...suggested].slice(0, limit);
  }

  async getFollowersCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followingId: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.prisma.userFollow.count({ where: { followerId: userId } });
  }

  async getFollowers(
    userId: string,
    limit: number = 20,
    pageState?: string,
    currentUserId?: string,
  ): Promise<FollowListResult> {
    const total = await this.prisma.userFollow.count({
      where: { followingId: userId },
    });
    const skip = pageState ? parseInt(pageState, 10) : 0;
    const rows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      select: { followerId: true },
      skip,
      take: limit,
      orderBy: { followerId: "asc" },
    });
    const ids = rows.map((r) => r.followerId);
    if (ids.length === 0) return { list: [], total };
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, avatar: true },
    });
    const orderMap = keyBy(
      ids.map((id, index) => ({ id, index })),
      "id",
    );
    let followingByCurrent: Set<string> = new Set();
    if (currentUserId && ids.length > 0) {
      const rels = await this.prisma.userFollow.findMany({
        where: { followerId: currentUserId, followingId: { in: ids } },
        select: { followingId: true },
      });
      followingByCurrent = new Set(rels.map((r) => r.followingId));
    }
    const list = orderBy(
      users,
      (user) => orderMap[user.id]?.index ?? 0,
      "asc",
    ).map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      ...(currentUserId !== undefined && {
        isFollowing: followingByCurrent.has(u.id),
      }),
    }));
    const nextPageState =
      skip + list.length < total ? String(skip + limit) : undefined;
    return {
      list,
      total,
      ...(nextPageState !== undefined && { pageState: nextPageState }),
    };
  }

  async getFollowing(
    userId: string,
    limit: number = 20,
    pageState?: string,
    currentUserId?: string,
  ): Promise<FollowListResult> {
    const total = await this.prisma.userFollow.count({
      where: { followerId: userId },
    });
    const skip = pageState ? parseInt(pageState, 10) : 0;
    const rows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
      skip,
      take: limit,
      orderBy: { followingId: "asc" },
    });
    const ids = rows.map((r) => r.followingId);
    if (ids.length === 0) return { list: [], total };
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true, avatar: true },
    });
    const orderMap = keyBy(
      ids.map((id, index) => ({ id, index })),
      "id",
    );
    let followingByCurrent: Set<string> = new Set();
    if (currentUserId && ids.length > 0) {
      const rels = await this.prisma.userFollow.findMany({
        where: { followerId: currentUserId, followingId: { in: ids } },
        select: { followingId: true },
      });
      followingByCurrent = new Set(rels.map((r) => r.followingId));
    }
    const list = orderBy(
      users,
      (user) => orderMap[user.id]?.index ?? 0,
      "asc",
    ).map((u) => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      ...(currentUserId !== undefined && {
        isFollowing: followingByCurrent.has(u.id),
      }),
    }));
    const nextPageState =
      skip + list.length < total ? String(skip + limit) : undefined;
    return {
      list,
      total,
      ...(nextPageState !== undefined && { pageState: nextPageState }),
    };
  }
}
