import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { SearchScopes, type SearchScope } from "@whatschat/shared-types";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { SearchService } from "@/search/application/search.service";

@ApiTags("搜索")
@Controller("search")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 60 } })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "搜索用户/帖子/话题" })
  async search(
    @Query("q") q: string,
    @Query("type") type: SearchScope = SearchScopes.Posts,
    @Query("limit") limit = "20",
    @Query("cursor") cursor?: string,
  ) {
    const limitNum = Math.min(parseInt(String(limit), 10) || 20, 100);
    if (!q?.trim()) return { success: true, data: { hits: [] } };
    const data =
      type === SearchScopes.Users
        ? await this.searchService.searchUsers(q.trim(), limitNum, cursor)
        : type === SearchScopes.Hashtags
          ? await this.searchService.searchHashtags(q.trim(), limitNum, cursor)
          : await this.searchService.searchPosts(q.trim(), limitNum, cursor);
    const payload: { hits: unknown[]; nextCursor?: string; total?: number } = {
      hits: data.hits,
    };
    if (data.nextCursor != null) payload.nextCursor = data.nextCursor;
    const total =
      "total" in data ? (data as { total?: number }).total : undefined;
    if (typeof total === "number") payload.total = total;
    return { success: true, data: payload };
  }
}
