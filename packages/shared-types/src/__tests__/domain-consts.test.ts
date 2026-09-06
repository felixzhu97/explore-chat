import { describe, it, expect } from "vitest";
import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "../primary-destination";
import { SearchScopes, type SearchScope } from "../search";

describe("PrimaryDestinations", () => {
  it("should_expose_glossary_aligned_destination_ids", () => {
    expect(Object.values(PrimaryDestinations)).toEqual([
      "feed",
      "chat",
      "reels",
      "explore",
      "user",
      "search",
    ]);
  });

  it("should_keep_feed_as_canonical_home_destination", () => {
    const destination: PrimaryDestination = PrimaryDestinations.Feed;
    expect(destination).toBe("feed");
  });
});

describe("SearchScopes", () => {
  it("should_match_nest_search_query_type_values", () => {
    const scopes: SearchScope[] = [
      SearchScopes.Posts,
      SearchScopes.Users,
      SearchScopes.Hashtags,
    ];
    expect(scopes).toEqual(["posts", "users", "hashtags"]);
  });
});
