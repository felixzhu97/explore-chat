import {
  Resolver,
  Query,
  ResolveField,
  Parent,
  Int,
  Args,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { FeedService } from "@/post/service/feed.service";
import { AdCreativeService } from "@/ads/service/ad-creative.service";
import { GqlJwtAuthGuard } from "./gql-auth.guard";
import { CurrentGqlUser } from "./current-gql-user.decorator";
import { FeedPageType, FeedEntryType, PostType } from "./feed.types";
import { PostLoader } from "./post.loader";

function entryCreatedAt(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

@Resolver(() => FeedEntryType)
export class FeedEntryResolver {
  constructor(
    private readonly postLoader: PostLoader,
    private readonly adCreativeService: AdCreativeService,
  ) {}

  @ResolveField(() => PostType, { nullable: true })
  async post(@Parent() parent: FeedEntryType): Promise<PostType | null> {
    if (parent.isSponsored && parent.adCreativeId) {
      const creative = await this.adCreativeService.getCreativeById(
        parent.adCreativeId,
      );
      if (!creative) return null;
      const t = new PostType();
      t.postId = creative.id;
      t.userId = parent.authorId;
      t.createdAt = parent.createdAt;
      t.caption = creative.body ?? null;
      t.type = "AD";
      t.mediaUrls = creative.mediaUrl ? [creative.mediaUrl] : [];
      t.coverUrl = creative.thumbnailUrl ?? null;
      t.location = null;
      t.likeCount = null;
      t.commentCount = null;
      t.saveCount = null;
      t.username = "Sponsored";
      t.avatar = null;
      t.isLiked = null;
      t.isSaved = null;
      t.autoTags = null;
      return t;
    }
    const loaded = await this.postLoader.load(parent.postId);
    if (!loaded) return null;
    return PostType.fromGql(loaded);
  }
}

@Resolver()
export class FeedResolver {
  constructor(
    private readonly feedService: FeedService,
    private readonly postLoader: PostLoader,
  ) {}

  @Query(() => FeedPageType)
  @UseGuards(GqlJwtAuthGuard)
  async feed(
    @CurrentGqlUser() user: { id: string },
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
    @Args("pageState", { nullable: true }) pageState?: string,
  ): Promise<FeedPageType> {
    this.postLoader.setCurrentUserId(user.id);
    const data = await this.feedService.getFeed(user.id, limit, pageState);
    const page = new FeedPageType();
    page.pageState = data.pageState ?? null;
    page.entries = (data.entries ?? []).map((e) => {
      const entry = new FeedEntryType();
      entry.postId = e.postId;
      entry.authorId = e.authorId;
      entry.createdAt = entryCreatedAt(e.createdAt);
      entry.isSponsored = (e as any).isSponsored ?? null;
      entry.adAccountId = (e as any).adAccountId ?? null;
      entry.adCampaignId = (e as any).adCampaignId ?? null;
      entry.adGroupId = (e as any).adGroupId ?? null;
      entry.adCreativeId = (e as any).adCreativeId ?? null;
      entry.post = null;
      return entry;
    });
    return page;
  }

  @Query(() => FeedPageType)
  @UseGuards(GqlJwtAuthGuard)
  async reels(
    @CurrentGqlUser() user: { id: string },
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 3 })
    limit: number,
    @Args("pageState", { nullable: true }) pageState?: string,
  ): Promise<FeedPageType> {
    this.postLoader.setCurrentUserId(user.id);
    const data = await this.feedService.getReels(user.id, limit, pageState);
    const page = new FeedPageType();
    page.pageState = data.pageState ?? null;
    page.entries = (data.entries ?? []).map((e) => {
      const entry = new FeedEntryType();
      entry.postId = e.postId;
      entry.authorId = e.authorId;
      entry.createdAt = entryCreatedAt(e.createdAt);
      entry.isSponsored = null;
      entry.adAccountId = null;
      entry.adCampaignId = null;
      entry.adGroupId = null;
      entry.adCreativeId = null;
      entry.post = null;
      return entry;
    });
    return page;
  }
}
