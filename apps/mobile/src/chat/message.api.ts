import type { HttpClient } from "@/core/api-client";
import type { Message } from "@/chat/message.model";
import {
  mapServerMessagePayload,
  mapServerMessagePayloadToMessage,
} from "@/chat/message.mapper";

export class MessageApi {
  constructor(private readonly http: HttpClient) {}

  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await this.http.get<{ success: boolean; data: unknown[] }>(
      `/messages/${chatId}`,
      { params: { page: 1, limit: 50 } },
    );
    if (!data.success || !Array.isArray(data.data)) return [];
    return data.data.map((m) =>
      mapServerMessagePayloadToMessage(
        m as Parameters<typeof mapServerMessagePayloadToMessage>[0],
      ),
    );
  }

  async sendMessage(
    chatId: string,
    content: string,
    type: string = "TEXT",
    clientMsgId?: string,
  ): Promise<Message> {
    const { data } = await this.http.post<{ success: boolean; data: unknown }>(
      "/messages",
      {
        chatId,
        content,
        type,
        ...(clientMsgId != null && { clientMsgId }),
      },
    );
    if (!data.success || !data.data) throw new Error("Send failed");
    return mapServerMessagePayload(data.data as Record<string, unknown>);
  }
}
