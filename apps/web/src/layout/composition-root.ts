import { getApiClient, type ApiClient } from "@/auth/api-client";
import { AuthApi } from "@/auth/auth-session";
import { ChatApi } from "@/chat/chat.api";
import { UserApi } from "@/profile/user.api";

export type AppComposition = {
  apiClient: ApiClient;
  chatApi: ChatApi;
  userApi: UserApi;
  authApi: AuthApi;
};

let composition: AppComposition | null = null;

export function getAppComposition(): AppComposition {
  if (!composition) {
    const apiClient = getApiClient();
    composition = {
      apiClient,
      chatApi: new ChatApi(apiClient),
      userApi: new UserApi(apiClient),
      authApi: new AuthApi(apiClient),
    };
  }
  return composition;
}
