package com.chat.common.aip;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class PageTokensTest {

  @Test
  void shouldClampPageSizeWhenOutOfRange() {
    assertEquals(20, PageTokens.clampPageSize(null));
    assertEquals(20, PageTokens.clampPageSize(0));
    assertEquals(50, PageTokens.clampPageSize(50));
    assertEquals(100, PageTokens.clampPageSize(500));
  }

  @Test
  void shouldRoundTripOffsetPageToken() {
    String token = PageTokens.nextOffsetToken(0, 20, true).orElseThrow();
    assertEquals(20, PageTokens.offsetFrom(token));
    assertTrue(PageTokens.nextOffsetToken(20, 20, false).isEmpty());
  }
}
