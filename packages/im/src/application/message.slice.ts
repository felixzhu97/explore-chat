import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "@chat/shared-types";

interface State {
  messages: Record<string, Message[]>;
}

const initialState: State = { messages: {} };

const slice = createSlice({
  name: "im/message",
  initialState,
  reducers: {
    addMessage: (s, a: PayloadAction<{ chatId: string; message: Message }>) => {
      const { chatId, message } = a.payload;
      if (!s.messages[chatId]) s.messages[chatId] = [];
      s.messages[chatId].push(message);
    },
    updateMessage: (
      s,
      a: PayloadAction<{ chatId: string; messageId: string; updates: Partial<Message> }>
    ) => {
      const list = s.messages[a.payload.chatId];
      if (!list) return;
      const idx = list.findIndex((m) => m.id === a.payload.messageId);
      if (idx !== -1) list[idx] = { ...list[idx], ...a.payload.updates };
    },
    deleteMessage: (s, a: PayloadAction<{ chatId: string; messageId: string }>) => {
      const list = s.messages[a.payload.chatId];
      if (list) s.messages[a.payload.chatId] = list.filter((m) => m.id !== a.payload.messageId);
    },
    setMessages: (s, a: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      s.messages[a.payload.chatId] = a.payload.messages;
    },
  },
});

export const {
  addMessage,
  updateMessage,
  deleteMessage,
  setMessages,
} = slice.actions;
export const messageReducer = slice.reducer;
