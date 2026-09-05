import { getApiClient, type ApiClient } from "@/auth/api-client";
import { AuthApi } from "@/auth/auth-session";
import { ChatApi, ChatsService } from "@/chat/services/chats.service";
import { UserApi, UsersService } from "@/profile/users.service";

export type AppComposition = {
  apiClient: ApiClient;
  chatApi: ChatApi;
  chatsService: ChatsService;
  userApi: UserApi;
  usersService: UsersService;
  authApi: AuthApi;
};

let composition: AppComposition | null = null;

export function getAppComposition(): AppComposition {
  if (!composition) {
    const apiClient = getApiClient();
    const chatApi = new ChatApi(apiClient);
    const userApi = new UserApi(apiClient);
    composition = {
      apiClient,
      chatApi,
      chatsService: new ChatsService(chatApi),
      userApi,
      usersService: new UsersService(userApi),
      authApi: new AuthApi(apiClient),
    };
  }
  return composition;
}
