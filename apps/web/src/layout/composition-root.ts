import { getApiClient, type ApiClient } from "@/auth/api-client";
import { AuthApi } from "@/auth/auth-session";
import { ChatApi } from "@/chat/chat.api";
import { UserApi, UsersService } from "@/profile/users.service";

export type AppComposition = {
  apiClient: ApiClient;
  chatApi: ChatApi;
  userApi: UserApi;
  usersService: UsersService;
  authApi: AuthApi;
};

let composition: AppComposition | null = null;

export function getAppComposition(): AppComposition {
  if (!composition) {
    const apiClient = getApiClient();
    const userApi = new UserApi(apiClient);
    composition = {
      apiClient,
      chatApi: new ChatApi(apiClient),
      userApi,
      usersService: new UsersService(userApi),
      authApi: new AuthApi(apiClient),
    };
  }
  return composition;
}
