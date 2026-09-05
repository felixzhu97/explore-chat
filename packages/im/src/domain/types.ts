import type { ImWsEvent, Message } from "@whatschat/shared-types";

export interface WebSocketMessage {
  type:
    | ImWsEvent
    | "message"
    | "typing"
    | "call_offer"
    | "call_answer"
    | "call_ice_candidate"
    | "call_end"
    | "call:incoming"
    | "call:answer"
    | "call:reject"
    | "call:offer"
    | "call:webrtc-answer"
    | "call:ice-candidate"
    | "call:end"
    | "user_status"
    | "message_read";
  data: Record<string, unknown>;
  from?: string;
  to?: string;
  timestamp?: number;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  typingUsers: string[];
  isConnected: boolean;
}
