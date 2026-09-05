import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import DataLoader from "dataloader";
import { PostService } from "@/post/service/post.service";

export type PostGql = Record<string, unknown> & {
  postId: string;
  userId: string;
  createdAt: string;
  caption: string | null;
  type: string;
  mediaUrls: string[];
  coverUrl?: string | null;
  location?: string | null;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  username?: string;
  avatar?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  autoTags?: string[];
};

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

@Injectable({ scope: Scope.REQUEST })
export class PostLoader {
  private loader: DataLoader<string, PostGql | null>;
  private currentUserId: string | undefined;

  constructor(
    private readonly postService: PostService,
    @Inject(REQUEST) private readonly req: Request,
  ) {
    this.loader = new DataLoader<string, PostGql | null>(
      async (postIds) => {
        const user = this.req.user as { id?: string } | undefined;
        const userId =
          this.currentUserId ??
          (typeof user?.id === "string" ? user.id : undefined);
        const rows = await this.postService.getPostsBatch([...postIds], userId);
        return rows.map((row) => {
          if (!row || typeof row !== "object") return null;
          const r = row as Record<string, unknown>;
          const postIdVal = r["postId"];
          if (typeof postIdVal !== "string") return null;
          const out: PostGql = {
            postId: postIdVal,
            userId: String(r["userId"] ?? ""),
            createdAt: toIso(r["createdAt"]),
            caption: (r["caption"] as string | null) ?? null,
            type: String(r["type"] ?? ""),
            mediaUrls: Array.isArray(r["mediaUrls"])
              ? (r["mediaUrls"] as string[])
              : [],
            ...(typeof r["coverUrl"] === "string" &&
              r["coverUrl"] !== "" && { coverUrl: r["coverUrl"] }),
            ...(r["location"] != null && {
              location: r["location"] as string | null,
            }),
            ...(typeof r["likeCount"] === "number" && {
              likeCount: r["likeCount"],
            }),
            ...(typeof r["commentCount"] === "number" && {
              commentCount: r["commentCount"],
            }),
            ...(typeof r["saveCount"] === "number" && {
              saveCount: r["saveCount"],
            }),
            ...(typeof r["username"] === "string" && {
              username: r["username"],
            }),
            ...(typeof r["avatar"] === "string" && { avatar: r["avatar"] }),
            ...(typeof r["isLiked"] === "boolean" && { isLiked: r["isLiked"] }),
            ...(typeof r["isSaved"] === "boolean" && { isSaved: r["isSaved"] }),
            ...(Array.isArray(r["autoTags"]) && {
              autoTags: r["autoTags"] as string[],
            }),
          };
          return out;
        });
      },
      { cache: true },
    );
  }

  setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  load(postId: string) {
    return this.loader.load(postId);
  }
}
