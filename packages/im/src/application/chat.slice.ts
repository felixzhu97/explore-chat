import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Chat } from "@chat/shared-types";

interface State {
  chats: Chat[];
  selectedChat: Chat | null;
}

const initialState: State = {
  chats: [],
  selectedChat: null,
};

const slice = createSlice({
  name: "im/chat",
  initialState,
  reducers: {
    setChats: (s, a: PayloadAction<Chat[]>) => {
      s.chats = a.payload;
    },
    addChat: (s, a: PayloadAction<Chat>) => {
      s.chats.push(a.payload);
    },
    updateChat: (s, a: PayloadAction<{ chatId: string; updates: Partial<Chat> }>) => {
      const idx = s.chats.findIndex((c) => c.id === a.payload.chatId);
      if (idx !== -1) s.chats[idx] = { ...s.chats[idx], ...a.payload.updates };
    },
    deleteChat: (s, a: PayloadAction<string>) => {
      s.chats = s.chats.filter((c) => c.id !== a.payload);
      if (s.selectedChat?.id === a.payload) s.selectedChat = null;
    },
    setSelectedChat: (s, a: PayloadAction<Chat | null>) => {
      s.selectedChat = a.payload;
    },
  },
});

export const {
  setChats,
  addChat,
  updateChat,
  deleteChat,
  setSelectedChat,
} = slice.actions;
export const chatReducer = slice.reducer;
