import type { ApiClient } from "@/auth/api-client";
import type { ApiResponse } from "@/auth/api-client";

export class ChatApi {
  constructor(private apiClient: ApiClient) {}

  async getChats(): Promise<ApiResponse> {
    return this.apiClient.get("/chats");
  }

  async getChatById(chatId: string): Promise<ApiResponse> {
    return this.apiClient.get(`/chats/${chatId}`);
  }

  async createChat(chatData: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<ApiResponse> {
    return this.apiClient.post("/chats", chatData);
  }

  async getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number },
  ): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/messages/${chatId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.apiClient.get(endpoint);
  }

  async sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
      mediaUrl?: string;
    },
  ): Promise<ApiResponse> {
    return this.apiClient.post("/messages", { ...messageData, chatId });
  }

  async markMessageAsRead(
    chatId: string,
    messageId: string,
  ): Promise<ApiResponse> {
    return this.apiClient.post(`/chats/${chatId}/messages/${messageId}/read`);
  }
}
