import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import difference from "lodash/difference";
import flatMap from "lodash/flatMap";
import orderBy from "lodash/orderBy";
import { getAppStore } from "@/layout/store-access";

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "voice";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface Attachment {
  id: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: MessageType;
  status: MessageStatus;
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: string;
  isStarred?: boolean;
  isForwarded?: boolean;
  attachments?: Attachment[];
  duration?: number;
  fileName?: string;
  fileSize?: string;
  location?: Location;
  mediaUrl?: string;
}

export function mapMessage(
  data: Partial<Message> &
    Pick<Message, "id" | "senderId" | "senderName" | "content" | "timestamp">,
): Message {
  return {
    type: data.type ?? "text",
    status: data.status ?? "sending",
    ...data,
  };
}

export function editMessage(message: Message, newContent: string): Message {
  return {
    ...message,
    content: newContent,
    isEdited: true,
    editedAt: new Date().toISOString(),
  };
}

export function toggleStarMessage(message: Message): Message {
  return { ...message, isStarred: !message.isStarred };
}

interface MessagesState {
  messages: { [contactId: string]: Message[] };
  currentUserId: string;
  typingUsers: { [contactId: string]: boolean };
  selectedMessages: string[];
  replyingTo: Message | null;
  editingMessage: Message | null;
  searchResults: Message[];
  starredMessages: string[];
}

const initialState: MessagesState = {
  messages: {},
  currentUserId: "current-user",
  typingUsers: {},
  selectedMessages: [],
  replyingTo: null,
  editingMessage: null,
  searchResults: [],
  starredMessages: [],
};

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (diffInHours < 24) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString("zh-CN", { weekday: "short" });
  } else {
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  }
}

export function canEditMessage(
  message: Message,
  currentUserId: string,
): boolean {
  const messageAge = Date.now() - new Date(message.timestamp).getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  return (
    message.senderId === currentUserId &&
    messageAge < fifteenMinutes &&
    message.type === "text"
  );
}

export function canDeleteMessage(
  message: Message,
  currentUserId: string,
): boolean {
  return message.senderId === currentUserId;
}

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (
      state,
      action: PayloadAction<{ [contactId: string]: Message[] }>,
    ) => {
      state.messages = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ contactId: string; message: Message }>,
    ) => {
      const { contactId, message } = action.payload;
      if (!state.messages[contactId]) state.messages[contactId] = [];
      state.messages[contactId].push(message);
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        contactId: string;
        messageId: string;
        updates: Partial<Message>;
      }>,
    ) => {
      const { contactId, messageId, updates } = action.payload;
      const list = state.messages[contactId];
      if (!list) return;
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx !== -1) list[idx] = { ...list[idx], ...updates };
    },
    deleteMessage: (
      state,
      action: PayloadAction<{ contactId: string; messageId: string }>,
    ) => {
      const { contactId, messageId } = action.payload;
      const list = state.messages[contactId];
      if (list) {
        state.messages[contactId] = list.filter((m) => m.id !== messageId);
      }
      state.selectedMessages = state.selectedMessages.filter(
        (id) => id !== messageId,
      );
    },
    deleteMessages: (
      state,
      action: PayloadAction<{ contactId: string; messageIds: string[] }>,
    ) => {
      const { contactId, messageIds } = action.payload;
      const list = state.messages[contactId];
      if (list) {
        const removeIds = new Set(messageIds);
        state.messages[contactId] = list.filter((m) => !removeIds.has(m.id));
      }
      state.selectedMessages = difference(state.selectedMessages, messageIds);
    },
    setTyping: (
      state,
      action: PayloadAction<{ contactId: string; isTyping: boolean }>,
    ) => {
      const { contactId, isTyping } = action.payload;
      state.typingUsers[contactId] = isTyping;
    },
    toggleMessageSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const idx = state.selectedMessages.indexOf(id);
      if (idx === -1) state.selectedMessages.push(id);
      else state.selectedMessages.splice(idx, 1);
    },
    clearSelection: (state) => {
      state.selectedMessages = [];
    },
    selectAllMessages: (
      state,
      action: PayloadAction<{ contactId: string }>,
    ) => {
      const list = state.messages[action.payload.contactId] || [];
      state.selectedMessages = list.map((m) => m.id);
    },
    setReplyingTo: (state, action: PayloadAction<Message | null>) => {
      state.replyingTo = action.payload;
    },
    setEditingMessage: (state, action: PayloadAction<Message | null>) => {
      state.editingMessage = action.payload;
    },
    toggleStarMessage: (
      state,
      action: PayloadAction<{ contactId: string; messageId: string }>,
    ) => {
      const { messageId } = action.payload;
      const idx = state.starredMessages.indexOf(messageId);
      if (idx === -1) state.starredMessages.push(messageId);
      else state.starredMessages.splice(idx, 1);
    },
    setSearchResults: (state, action: PayloadAction<Message[]>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  deleteMessages,
  setTyping,
  toggleMessageSelection,
  clearSelection,
  selectAllMessages,
  setReplyingTo,
  setEditingMessage,
  toggleStarMessage: toggleStarMessageAction,
  setSearchResults,
  clearSearchResults,
} = messagesSlice.actions;

/** Selectors for use outside React (e.g. in services) - pass state.messages */
export function getMessagesForContact(
  state: MessagesState,
  contactId: string,
): Message[] {
  return state.messages[contactId] || [];
}

export function getMessageById(
  state: MessagesState,
  contactId: string,
  messageId: string,
): Message | undefined {
  const list = state.messages[contactId] || [];
  return list.find((m) => m.id === messageId);
}

export function getLastMessage(
  state: MessagesState,
  contactId: string,
): Message | undefined {
  const list = state.messages[contactId] || [];
  return list[list.length - 1];
}

export function getUnreadCount(
  state: MessagesState,
  contactId: string,
): number {
  const list = state.messages[contactId] || [];
  return list.filter(
    (m) => m.senderId !== state.currentUserId && m.status !== "read",
  ).length;
}

export function isUserTyping(state: MessagesState, contactId: string): boolean {
  return state.typingUsers[contactId] || false;
}

export function getStarredMessages(state: MessagesState): Message[] {
  const starredIds = new Set(state.starredMessages);
  const starred = flatMap(Object.values(state.messages), (list) =>
    (list || []).filter((msg) => starredIds.has(msg.id)),
  );
  return orderBy(starred, (msg) => new Date(msg.timestamp).getTime(), "desc");
}

export function searchMessages(
  state: MessagesState,
  query: string,
  contactId?: string,
): Message[] {
  const results: Message[] = [];
  const q = query.toLowerCase();
  const toSearch = contactId
    ? { [contactId]: state.messages[contactId] || [] }
    : state.messages;
  for (const cId in toSearch) {
    const list = toSearch[cId] || [];
    list.forEach((msg) => {
      if (msg.content.toLowerCase().includes(q)) results.push(msg);
    });
  }
  return orderBy(results, (msg) => new Date(msg.timestamp).getTime(), "desc");
}

export const messagesReducer = messagesSlice.reducer;
export default messagesReducer;

const selectMessagesForContact = getMessagesForContact;
const selectMessageById = getMessageById;
const selectLastMessage = getLastMessage;
const selectUnreadCount = getUnreadCount;
const selectIsUserTyping = isUserTyping;
const selectStarredMessages = getStarredMessages;
const selectSearchMessages = searchMessages;

export class MessagesService {
  private getState(): MessagesState {
    return (getAppStore().getState() as { messages: MessagesState }).messages;
  }

  getMessagesForContact(contactId: string): Message[] {
    return selectMessagesForContact(this.getState(), contactId);
  }

  addMessage(contactId: string, message: Message): void {
    getAppStore().dispatch(addMessage({ contactId, message }));
  }

  updateMessage(
    contactId: string,
    messageId: string,
    updates: Partial<Message>,
  ): void {
    getAppStore().dispatch(updateMessage({ contactId, messageId, updates }));
  }

  deleteMessage(contactId: string, messageId: string): void {
    getAppStore().dispatch(deleteMessage({ contactId, messageId }));
  }

  deleteMessages(contactId: string, messageIds: string[]): void {
    getAppStore().dispatch(deleteMessages({ contactId, messageIds }));
  }

  async sendMessage(
    contactId: string,
    content: string,
    type: Message["type"] = "text",
  ): Promise<void> {
    const state = this.getState();
    const message = mapMessage({
      id: generateMessageId(),
      senderId: state.currentUserId,
      senderName: "我",
      content,
      timestamp: new Date().toISOString(),
      type,
      status: "sent",
    });

    getAppStore().dispatch(addMessage({ contactId, message }));
  }

  editMessageContent(
    contactId: string,
    messageId: string,
    newContent: string,
  ): void {
    const state = this.getState();
    const message = selectMessageById(state, contactId, messageId);
    if (message && canEditMessage(message, state.currentUserId)) {
      const edited = editMessage(message, newContent);
      getAppStore().dispatch(
        updateMessage({
          contactId,
          messageId,
          updates: {
            content: edited.content,
            isEdited: edited.isEdited,
            editedAt: edited.editedAt,
          },
        }),
      );
      getAppStore().dispatch(setEditingMessage(null));
    }
  }

  forwardMessage(messageId: string, targetContactIds: string[]): void {
    const state = this.getState();
    let originalMessage: Message | undefined;
    for (const contactId in state.messages) {
      const found = (state.messages[contactId] || []).find(
        (msg) => msg.id === messageId,
      );
      if (found) {
        originalMessage = found;
        break;
      }
    }

    if (originalMessage) {
      targetContactIds.forEach((contactId) => {
        const forwardedMessage = mapMessage({
          ...originalMessage!,
          id: generateMessageId(),
          senderId: state.currentUserId,
          senderName: "我",
          timestamp: new Date().toISOString(),
          status: "sending",
          isForwarded: true,
        });
        getAppStore().dispatch(
          addMessage({ contactId, message: forwardedMessage }),
        );
      });
    }
  }

  replyToMessage(contactId: string, replyTo: Message, content: string): void {
    const state = this.getState();
    const message = mapMessage({
      id: generateMessageId(),
      senderId: state.currentUserId,
      senderName: "我",
      content,
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sending",
      replyTo: replyTo.id,
    });

    getAppStore().dispatch(addMessage({ contactId, message }));
    getAppStore().dispatch(setReplyingTo(null));
  }

  markAsRead(contactId: string, messageIds: string[]): void {
    messageIds.forEach((messageId) => {
      getAppStore().dispatch(
        updateMessage({ contactId, messageId, updates: { status: "read" } }),
      );
    });
  }

  markAsDelivered(contactId: string, messageIds: string[]): void {
    const state = this.getState();
    messageIds.forEach((messageId) => {
      const message = selectMessageById(state, contactId, messageId);
      if (message && message.status === "sent") {
        getAppStore().dispatch(
          updateMessage({
            contactId,
            messageId,
            updates: { status: "delivered" },
          }),
        );
      }
    });
  }

  updateMessageStatus(
    contactId: string,
    messageId: string,
    status: Message["status"],
  ): void {
    getAppStore().dispatch(
      updateMessage({ contactId, messageId, updates: { status } }),
    );
  }

  toggleStarMessage(contactId: string, messageId: string): void {
    const state = this.getState();
    const message = selectMessageById(state, contactId, messageId);
    if (message) {
      const starredMessage = toggleStarMessage(message);
      getAppStore().dispatch(
        updateMessage({
          contactId,
          messageId,
          updates: { isStarred: starredMessage.isStarred },
        }),
      );
      getAppStore().dispatch(toggleStarMessageAction({ contactId, messageId }));
    }
  }

  getStarredMessages(): Message[] {
    return selectStarredMessages(this.getState());
  }

  searchMessages(query: string, contactId?: string): Message[] {
    const state = this.getState();
    const results = selectSearchMessages(state, query, contactId);
    getAppStore().dispatch(setSearchResults(results));
    return results;
  }

  getMessageById(contactId: string, messageId: string): Message | undefined {
    return selectMessageById(this.getState(), contactId, messageId);
  }

  getLastMessage(contactId: string): Message | undefined {
    return selectLastMessage(this.getState(), contactId);
  }

  getUnreadCount(contactId: string): number {
    return selectUnreadCount(this.getState(), contactId);
  }

  setTyping(contactId: string, isTyping: boolean): void {
    getAppStore().dispatch(setTyping({ contactId, isTyping }));
  }

  isUserTyping(contactId: string): boolean {
    return selectIsUserTyping(this.getState(), contactId);
  }
}

let messagesServiceInstance: MessagesService | null = null;

export const getMessagesService = (): MessagesService => {
  if (!messagesServiceInstance) {
    messagesServiceInstance = new MessagesService();
  }
  return messagesServiceInstance;
};
