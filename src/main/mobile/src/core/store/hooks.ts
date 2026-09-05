import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { store, type RootState, type AppDispatch } from "@/core/store";

export { store };
export type { RootState, AppDispatch };

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuthStore = <T>(selector: (auth: RootState["auth"]) => T): T =>
  useAppSelector((s) => selector(s.auth));

export const useSocketStore = <T>(
  selector: (socket: RootState["socket"]) => T,
): T => useAppSelector((s) => selector(s.socket));

export const useChatStore = <T>(selector: (chat: RootState["chat"]) => T): T =>
  useAppSelector((s) => selector(s.chat));

export const useMessageStore = <T>(
  selector: (message: RootState["message"]) => T,
): T => useAppSelector((s) => selector(s.message));

export const useThemeStore = <T>(
  selector: (theme: RootState["theme"]) => T,
): T => useAppSelector((s) => selector(s.theme));

export { setAuth, logout, hydrateAuth } from "@/core/store/slices/authSlice";
export {
  connectSocket,
  disconnectSocket,
} from "@/core/store/slices/socketSlice";
export {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
} from "@chat/im";
export { setThemeMode } from "@/core/store/slices/themeSlice";

export { feedApi } from "@/feed/feedApi";
