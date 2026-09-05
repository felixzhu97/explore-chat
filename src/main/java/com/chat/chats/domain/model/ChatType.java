package com.chat.chats.domain.model;

/** Kind of conversation: private direct chat or multi-party group. */
public enum ChatType {
  /** One-to-one direct conversation. */
  PRIVATE,
  /** Multi-party group conversation. */
  GROUP
}
