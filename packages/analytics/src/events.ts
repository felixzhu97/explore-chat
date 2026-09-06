export const PAGE_VIEW = "page_view";
export const CHAT_OPEN = "chat_open";
export const SEND_MESSAGE = "send_message";
export const CALL_START = "call_start";
export const CALL_END = "call_end";
export const AI_ACTION = "ai_action";
export const POST_VIEW = "post_view";
export const POST_LIKE = "post_like";
export const POST_SAVE = "post_save";

export type KnownEventName =
  | typeof PAGE_VIEW
  | typeof CHAT_OPEN
  | typeof SEND_MESSAGE
  | typeof CALL_START
  | typeof CALL_END
  | typeof AI_ACTION
  | typeof POST_VIEW
  | typeof POST_LIKE
  | typeof POST_SAVE;

export interface PageViewPayload {
  path?: string;
  title?: string;
}

export interface ChatOpenPayload {
  chatId: string;
  chatType?: string;
}

export interface SendMessagePayload {
  chatId: string;
  type?: string;
}

export interface CallStartPayload {
  chatId?: string;
  callType?: string;
}

export interface CallEndPayload {
  chatId?: string;
  callType?: string;
  duration?: number;
}

export type AiActionType = "text" | "image" | "video" | "voice";
export type AiActionStep = "open" | "generate_success" | "send_to_chat";

export interface AiActionPayload {
  action: AiActionType;
  step: AiActionStep;
  chatId?: string;
}

export interface PostViewPayload {
  postId: string;
  authorId?: string;
  durationMs?: number;
}

export interface PostLikePayload {
  postId: string;
}

export interface PostSavePayload {
  postId: string;
}

export type KnownEventPayloadMap = {
  [PAGE_VIEW]: PageViewPayload;
  [CHAT_OPEN]: ChatOpenPayload;
  [SEND_MESSAGE]: SendMessagePayload;
  [CALL_START]: CallStartPayload;
  [CALL_END]: CallEndPayload;
  [AI_ACTION]: AiActionPayload;
  [POST_VIEW]: PostViewPayload;
  [POST_LIKE]: PostLikePayload;
  [POST_SAVE]: PostSavePayload;
};
