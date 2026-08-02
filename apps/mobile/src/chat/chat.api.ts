import type { HttpClient } from "@/core/api-client";
import type { Chat } from "@/chat/chat.model";
import {
  mapServerChatPayloadToChat,
  type ServerChatPayload,
} from "@/chat/chat.mapper";

export class ChatApi {
  constructor(private readonly http: HttpClient) {}

  async getChats(): Promise<Chat[]> {
    const { data } = await this.http.get<{ success: boolean; data: unknown[] }>(
      "/chats",
    );
    if (!data.success || !Array.isArray(data.data)) return [];
    return (data.data as ServerChatPayload[]).map(mapServerChatPayloadToChat);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data } = await this.http.get<{ success: boolean; data: unknown }>(
        `/chats/${chatId}`,
      );
      if (!data.success || !data.data) return null;
      return mapServerChatPayloadToChat(data.data as ServerChatPayload);
    } catch {
      return null;
    }
  }
}
