/** Socket.IO IM event names — align with src/main/im-contract/openapi.yaml ImWsEvent. */
export const ImWsEvents = {
  messageSend: "message:send",
  messageSent: "message:sent",
  messageReceived: "message:received",
  messageDelivered: "message:delivered",
  messageRead: "message:read",
  messageTyping: "message:typing",
  messageReaction: "message:reaction",
  chatJoin: "chat:join",
  chatLeave: "chat:leave",
} as const;

export type ImWsEvent = (typeof ImWsEvents)[keyof typeof ImWsEvents];
