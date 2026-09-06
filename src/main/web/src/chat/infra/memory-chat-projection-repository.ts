import type {
  ChatProjectionRepository,
  ChatProjectionRow,
  MessageProjectionRow,
} from "@/chat/domain/repository";

/** In-memory adapter — same semantics as IndexedDB; swap for tests / SSR. */
export function createMemoryChatProjectionRepository(): ChatProjectionRepository {
  const chats = new Map<string, ChatProjectionRow>();
  const messages = new Map<string, MessageProjectionRow>();

  function touchChatPreview(row: MessageProjectionRow): void {
    const chat = chats.get(row.chatId) ?? { id: row.chatId };
    chats.set(row.chatId, {
      ...chat,
      lastMessageId: row.id,
      lastMessageContent: row.content,
      lastMessageAt: row.createdAt ?? row.updatedAt,
      updatedAt: row.createdAt ?? row.updatedAt ?? chat.updatedAt,
    });
  }

  return {
    async listChats() {
      return [...chats.values()].sort((a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      );
    },
    async upsertChats(rows) {
      for (const row of rows) {
        chats.set(row.id, { ...chats.get(row.id), ...row });
      }
    },
    async listMessages(chatId) {
      return [...messages.values()]
        .filter((m) => m.chatId === chatId)
        .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    },
    async replaceMessages(chatId, rows) {
      for (const [id, m] of messages) {
        if (m.chatId === chatId) messages.delete(id);
      }
      for (const row of rows) {
        messages.set(row.id, { ...row, chatId });
      }
      if (rows.length > 0) {
        const last = [...rows].sort((a, b) =>
          (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
        )[rows.length - 1];
        touchChatPreview(last);
      }
    },
    async upsertMessage(row) {
      let existingId: string | undefined;
      if (row.clientMsgId) {
        for (const m of messages.values()) {
          if (m.clientMsgId === row.clientMsgId) {
            existingId = m.id;
            break;
          }
        }
      }
      if (!existingId && messages.has(row.id)) existingId = row.id;
      if (existingId && existingId !== row.id) {
        messages.delete(existingId);
      }
      messages.set(row.id, row);
      touchChatPreview(row);
    },
  };
}
