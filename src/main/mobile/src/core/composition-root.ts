import {
  apiClient,
  createHttpClientFromAxios,
  type HttpClient,
} from "@/core/api-client";
import { AuthApi } from "@/auth/auth.api";
import { FeedApi } from "@/feed/feed.api";
import { ChatApi } from "@/chat/chat.api";
import { MessageApi } from "@/chat/message.api";

let httpSingleton: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (!httpSingleton) {
    httpSingleton = createHttpClientFromAxios(apiClient);
  }
  return httpSingleton;
}

let feedApi: FeedApi | null = null;
export function getFeedApi(): FeedApi {
  if (!feedApi) {
    feedApi = new FeedApi(getHttpClient());
  }
  return feedApi;
}

let authApi: AuthApi | null = null;
export function getAuthApi(): AuthApi {
  if (!authApi) {
    authApi = new AuthApi(getHttpClient());
  }
  return authApi;
}

let chatApi: ChatApi | null = null;
export function getChatApi(): ChatApi {
  if (!chatApi) {
    chatApi = new ChatApi(getHttpClient());
  }
  return chatApi;
}

let messageApi: MessageApi | null = null;
export function getMessageApi(): MessageApi {
  if (!messageApi) {
    messageApi = new MessageApi(getHttpClient());
  }
  return messageApi;
}
