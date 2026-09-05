package com.chat.common.aip;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Opaque AIP-158 offset page_token helpers. */
public final class PageTokens {

  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final int MAX_PAGE_SIZE = 100;

  private static final Pattern OFFSET =
      Pattern.compile("\"offset\"\\s*:\\s*(\\d+)");

  private PageTokens() {}

  public static int clampPageSize(Integer pageSize) {
    if (pageSize == null || pageSize < 1) {
      return DEFAULT_PAGE_SIZE;
    }
    return Math.min(pageSize, MAX_PAGE_SIZE);
  }

  public static int offsetFrom(String pageToken) {
    if (pageToken == null || pageToken.isBlank()) {
      return 0;
    }
    try {
      String json =
          new String(Base64.getUrlDecoder().decode(pageToken), StandardCharsets.UTF_8);
      Matcher matcher = OFFSET.matcher(json);
      if (matcher.find()) {
        return Math.max(0, Integer.parseInt(matcher.group(1)));
      }
      return 0;
    } catch (RuntimeException ex) {
      return 0;
    }
  }

  public static Optional<String> nextOffsetToken(int offset, int pageSize, boolean hasMore) {
    if (!hasMore) {
      return Optional.empty();
    }
    String json = "{\"kind\":\"offset\",\"offset\":" + (offset + pageSize) + "}";
    return Optional.of(
        Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(json.getBytes(StandardCharsets.UTF_8)));
  }
}
