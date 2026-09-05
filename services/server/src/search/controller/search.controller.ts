import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { SearchScopes, type SearchScope } from "@whatschat/shared-types";
import { JwtAuthGuard } from "@/auth/controller/jwt-auth.guard";
import { SearchService } from "@/search/service/search.service";
import {
  clampPageSize,
  cursorFromPageToken,
  nextCursorPageToken,
} from "@/core/aip/page-token";

@ApiTags("search")
@Controller("search")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
@Throttle({ default: { ttl: 60000, limit: 60 } })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Search users, posts, or hashtags" })
  async search(
    @Query("q") q: string,
    @Query("type") type: SearchScope = SearchScopes.Posts,
    @Query("page_size") pageSizeRaw?: string,
    @Query("page_token") pageToken?: string,
  ) {
    const pageSize = clampPageSize(
      pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined,
    );
    if (!q?.trim()) return { hits: [] as unknown[] };

    const cursor = cursorFromPageToken(pageToken);
    const data =
      type === SearchScopes.Users
        ? await this.searchService.searchUsers(q.trim(), pageSize, cursor)
        : type === SearchScopes.Hashtags
          ? await this.searchService.searchHashtags(q.trim(), pageSize, cursor)
          : await this.searchService.searchPosts(q.trim(), pageSize, cursor);

    const total =
      "total" in data ? (data as { total?: number }).total : undefined;

    return {
      hits: data.hits,
      next_page_token: nextCursorPageToken(data.nextCursor),
      ...(typeof total === "number" && { total_size: total }),
    };
  }
}
