import { describe, it, expect } from "vitest";
import {
  PrimaryDestinations,
  type PrimaryDestination,
} from "../primary-destination";
import {
  SearchScopes,
  SearchUiScopes,
  type SearchScope,
  type SearchUiScope,
} from "../search";
import {
  VoiceGenTargetLanguages,
  VoiceTranslateTargetLanguages,
  type VoiceGenTargetLanguage,
  type VoiceTranslateTargetLanguage,
} from "../voice-gen";

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

  it("should_include_all_only_in_ui_scopes", () => {
    const ui: SearchUiScope = SearchUiScopes.All;
    expect(ui).toBe("all");
    expect(Object.values(SearchScopes) as string[]).not.toContain("all");
    expect(Object.values(SearchUiScopes)).toContain("all");
  });
});

describe("VoiceGenTargetLanguages", () => {
  it("should_include_auto_zh_and_en_for_generate", () => {
    const langs: VoiceGenTargetLanguage[] = [
      VoiceGenTargetLanguages.Auto,
      VoiceGenTargetLanguages.Zh,
      VoiceGenTargetLanguages.En,
    ];
    expect(langs).toEqual(["auto", "zh", "en"]);
  });

  it("should_limit_translate_targets_to_zh_and_en", () => {
    const langs: VoiceTranslateTargetLanguage[] = [
      VoiceTranslateTargetLanguages.Zh,
      VoiceTranslateTargetLanguages.En,
    ];
    expect(langs).toEqual(["zh", "en"]);
    expect(
      Object.values(VoiceTranslateTargetLanguages) as string[],
    ).not.toContain("auto");
  });
});
