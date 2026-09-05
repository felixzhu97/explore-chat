import { configureStore } from "@reduxjs/toolkit";
import { chatReducer, messageReducer } from "@chat/im";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import socketReducer from "./slices/socketSlice";
import { feedApi } from "@/feed/feedApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    message: messageReducer,
    theme: themeReducer,
    socket: socketReducer,
    [feedApi.reducerPath]: feedApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload"],
        ignoredPaths: ["socket.socket"],
      },
    }).concat(feedApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
