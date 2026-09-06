import type { ApiClient } from "@/auth/api-client";
import { getApiClient } from "@/auth/api-client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ContactGroupMember } from "@/shared/types/contact";

export type { ContactGroupMember };

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
  phone?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  lastSeen?: string;
  pinned?: boolean;
  muted?: boolean;
  blocked?: boolean;
  members?: ContactGroupMember[];
  memberCount?: number;
  description?: string;
  admin?: string[];
}

export function mapContact(
  data: Partial<Contact> &
    Pick<Contact, "id" | "name" | "avatar" | "lastMessage" | "timestamp">,
): Contact {
  return {
    unreadCount: data.unreadCount ?? 0,
    isOnline: data.isOnline ?? false,
    isGroup: data.isGroup ?? false,
    ...data,
  };
}

export class ChatApi {
  constructor(private apiClient: ApiClient) {}

  async getChats(): Promise<{ chats: unknown[] }> {
    return this.apiClient.get<{ chats: unknown[] }>("/chats");
  }

  async getChatById(chatId: string): Promise<unknown> {
    return this.apiClient.get(`/chats/${chatId}`);
  }

  async createChat(chatData: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<unknown> {
    return this.apiClient.post("/chats", chatData);
  }

  async getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number; page_token?: string },
  ): Promise<{ messages: unknown[]; next_page_token?: string }> {
    const queryParams = new URLSearchParams();
    const pageSize = params?.limit ?? 50;
    queryParams.append("page_size", pageSize.toString());
    if (params?.page_token) {
      queryParams.append("page_token", params.page_token);
    }

    const endpoint = `/chats/${chatId}/messages?${queryParams.toString()}`;
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
  ): Promise<unknown> {
    return this.apiClient.post(`/chats/${chatId}/messages`, messageData);
  }

  async markMessageAsRead(_chatId: string, _messageId: string): Promise<void> {
    return Promise.resolve();
  }
}

import type { Message } from "@/chat/services/messages.service";
import { mapMessage } from "@/chat/services/messages.service";

export type ApiChatRow = {
  id: string;
  name?: string;
  avatar?: string;
  lastMessage?: { content?: string };
  updatedAt?: string;
  type?: string;
  participants?: { isOnline?: boolean }[];
};

export type ApiMessageRow = {
  id: string;
  senderId: string;
  sender?: { username?: string };
  content: string;
  timestamp?: string;
  createdAt?: string;
  type?: string;
  mediaUrl?: string;
};

export function mapApiChatRowToContact(chat: ApiChatRow): Contact {
  return mapContact({
    id: chat.id,
    name: chat.name || "Chat",
    avatar: chat.avatar || "",
    lastMessage: chat.lastMessage?.content ?? "",
    timestamp: chat.updatedAt ?? "",
    unreadCount: 0,
    isOnline: chat.participants?.some((p) => p.isOnline) ?? false,
    isGroup: chat.type === "GROUP",
  });
}

export function mapApiMessageRowToMessage(msg: ApiMessageRow): Message {
  const ts =
    typeof msg.timestamp === "string"
      ? msg.timestamp
      : (msg.createdAt ?? new Date().toISOString());
  const typeRaw = msg.type?.toLowerCase() ?? "text";
  return mapMessage({
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.sender?.username ?? "",
    content: msg.content,
    timestamp: ts,
    type: typeRaw as Message["type"],
    status: "delivered",
    ...(msg.mediaUrl != null && { mediaUrl: msg.mediaUrl }),
  });
}

export function mapUnknownToContactCreate(data: unknown): Contact {
  return mapContact(data as Parameters<typeof mapContact>[0]);
}

export function mapUnknownToMessageCreate(data: unknown): Message {
  return mapMessage(data as Parameters<typeof mapMessage>[0]);
}

interface ContactsState {
  contacts: Contact[];
  selectedContactId: string | null;
  searchQuery: string;
  favoriteContacts: string[];
  blockedContacts: string[];
}

const initialState: ContactsState = {
  contacts: [],
  selectedContactId: null,
  searchQuery: "",
  favoriteContacts: [],
  blockedContacts: [],
};

function filterByQuery(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts;
  const q = query.toLowerCase();
  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.phoneNumber && c.phoneNumber.includes(q)),
  );
}

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    updateContact: (
      state,
      action: PayloadAction<{ contactId: string; updates: Partial<Contact> }>,
    ) => {
      const idx = state.contacts.findIndex(
        (c) => c.id === action.payload.contactId,
      );
      if (idx !== -1) {
        state.contacts[idx] = {
          ...state.contacts[idx],
          ...action.payload.updates,
        };
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      if (state.selectedContactId === action.payload) {
        state.selectedContactId = null;
      }
    },
    setSelectedContact: (state, action: PayloadAction<string | null>) => {
      state.selectedContactId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.favoriteContacts.includes(id)) {
        state.favoriteContacts.push(id);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favoriteContacts = state.favoriteContacts.filter(
        (id) => id !== action.payload,
      );
    },
    blockContact: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (!state.blockedContacts.includes(id)) {
        state.blockedContacts.push(id);
      }
    },
    unblockContact: (state, action: PayloadAction<string>) => {
      state.blockedContacts = state.blockedContacts.filter(
        (id) => id !== action.payload,
      );
    },
  },
});

export const {
  setContacts,
  addContact,
  updateContact,
  deleteContact,
  setSelectedContact,
  setSearchQuery,
  addToFavorites,
  removeFromFavorites,
  blockContact,
  unblockContact,
} = contactsSlice.actions;

export const selectFilteredContacts = (state: { contacts: ContactsState }) =>
  filterByQuery(state.contacts.contacts, state.contacts.searchQuery);
export const selectContactById = (
  state: { contacts: ContactsState },
  id: string,
) => state.contacts.contacts.find((c) => c.id === id);
export const selectSelectedContact = (state: { contacts: ContactsState }) =>
  state.contacts.selectedContactId
    ? (state.contacts.contacts.find(
        (c) => c.id === state.contacts.selectedContactId,
      ) ?? null)
    : null;

export const contactsReducer = contactsSlice.reducer;
export default contactsReducer;

export class ChatsService {
  constructor(private readonly chatApi: ChatApi) {}

  async getChats(): Promise<Contact[]> {
    try {
      const response = await this.chatApi.getChats();
      const rows = Array.isArray(response.chats) ? response.chats : [];
      return rows.map((chat) => mapApiChatRowToContact(chat as ApiChatRow));
    } catch (error) {
      console.error("获取聊天列表失败:", error);
      return [];
    }
  }

  async getChatById(chatId: string): Promise<Contact | null> {
    try {
      const response = await this.chatApi.getChatById(chatId);
      if (!response) return null;
      return mapUnknownToContactCreate(response);
    } catch (error) {
      console.error("获取聊天详情失败:", error);
      return null;
    }
  }

  async createChat(data: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<Contact> {
    try {
      const response = await this.chatApi.createChat(data);
      if (!response) throw new Error("创建聊天失败");
      return mapUnknownToContactCreate(response);
    } catch (error) {
      console.error("创建聊天失败:", error);
      throw error;
    }
  }

  async getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number; page_token?: string },
  ): Promise<Message[]> {
    try {
      const response = await this.chatApi.getChatMessages(chatId, params);
      const rows = Array.isArray(response.messages) ? response.messages : [];
      return rows.map((msg) => mapApiMessageRowToMessage(msg as ApiMessageRow));
    } catch (error) {
      console.error("获取聊天消息失败:", error);
      return [];
    }
  }

  async sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
      mediaUrl?: string;
    },
  ): Promise<Message> {
    try {
      const response = await this.chatApi.sendMessage(chatId, messageData);
      if (!response) throw new Error("发送消息失败");
      return mapUnknownToMessageCreate(response);
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }

  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    await this.chatApi.markMessageAsRead(chatId, messageId);
  }
}

let chatsServiceInstance: ChatsService | null = null;

export const getChatsService = (): ChatsService => {
  if (!chatsServiceInstance) {
    chatsServiceInstance = new ChatsService(new ChatApi(getApiClient()));
  }
  return chatsServiceInstance;
};
