import type { HttpClient } from "@/core/api-client";
import type { Chat } from "@/chat/chat.model";
import {
  mapServerChatPayloadToChat,
  type ServerChatPayload,
} from "@/chat/chat.mapper";

export class ChatApi {
  constructor(private readonly http: HttpClient) {}

  async getChats(): Promise<Chat[]> {
    const { data } = await this.http.get<{ chats?: unknown[] }>("/chats");
    const rows = Array.isArray(data?.chats) ? data.chats : [];
    return (rows as ServerChatPayload[]).map(mapServerChatPayloadToChat);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data } = await this.http.get<unknown>(`/chats/${chatId}`);
      if (!data) return null;
      return mapServerChatPayloadToChat(data as ServerChatPayload);
    } catch {
      return null;
    }
  }
}
