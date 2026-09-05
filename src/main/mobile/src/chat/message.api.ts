import type { HttpClient } from "@/core/api-client";
import type { Message } from "@/chat/message.model";
import {
  mapServerMessagePayload,
  mapServerMessagePayloadToMessage,
} from "@/chat/message.mapper";

export class MessageApi {
  constructor(private readonly http: HttpClient) {}

  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await this.http.get<{
      messages?: unknown[];
      next_page_token?: string;
    }>(`/chats/${chatId}/messages`, {
      params: { page_size: 50 },
    });
    const rows = Array.isArray(data?.messages) ? data.messages : [];
    return rows.map((m) =>
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
    const { data } = await this.http.post<unknown>(
      `/chats/${chatId}/messages`,
      {
        content,
        type,
        ...(clientMsgId != null && { clientMsgId }),
      },
    );
    if (!data) throw new Error("Send failed");
    return mapServerMessagePayload(data as Record<string, unknown>);
  }
}
