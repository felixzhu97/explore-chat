import type { Message } from "../message.model";
import { editMessage, mapMessage, toggleStarMessage } from "../message.model";
import { store } from "@/layout/store";
import {
  addMessage,
  updateMessage,
  deleteMessage,
  deleteMessages,
  setTyping,
  setReplyingTo,
  setEditingMessage,
  setSearchResults,
  toggleStarMessage as toggleStarMessageAction,
  generateMessageId,
  canEditMessage,
  getMessagesForContact as selectMessagesForContact,
  getMessageById as selectMessageById,
  getLastMessage as selectLastMessage,
  getUnreadCount as selectUnreadCount,
  isUserTyping as selectIsUserTyping,
  getStarredMessages as selectStarredMessages,
  searchMessages as selectSearchMessages,
} from "@/chat/messagesSlice";

export class MessagesService {
  private getState() {
    return store.getState().messages;
  }

  getMessagesForContact(contactId: string): Message[] {
    return selectMessagesForContact(this.getState(), contactId);
  }

  addMessage(contactId: string, message: Message): void {
    store.dispatch(addMessage({ contactId, message }));
  }

  updateMessage(
    contactId: string,
    messageId: string,
    updates: Partial<Message>,
  ): void {
    store.dispatch(updateMessage({ contactId, messageId, updates }));
  }

  deleteMessage(contactId: string, messageId: string): void {
    store.dispatch(deleteMessage({ contactId, messageId }));
  }

  deleteMessages(contactId: string, messageIds: string[]): void {
    store.dispatch(deleteMessages({ contactId, messageIds }));
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
      status: "sending",
    });

    store.dispatch(addMessage({ contactId, message }));

    setTimeout(() => {
      store.dispatch(
        updateMessage({
          contactId,
          messageId: message.id,
          updates: { status: "sent" },
        }),
      );
      setTimeout(() => {
        store.dispatch(
          updateMessage({
            contactId,
            messageId: message.id,
            updates: { status: "delivered" },
          }),
        );
      }, 1000);
    }, 500);
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
      store.dispatch(
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
      store.dispatch(setEditingMessage(null));
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
        store.dispatch(addMessage({ contactId, message: forwardedMessage }));
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

    store.dispatch(addMessage({ contactId, message }));
    store.dispatch(setReplyingTo(null));
  }

  markAsRead(contactId: string, messageIds: string[]): void {
    messageIds.forEach((messageId) => {
      store.dispatch(
        updateMessage({ contactId, messageId, updates: { status: "read" } }),
      );
    });
  }

  markAsDelivered(contactId: string, messageIds: string[]): void {
    const state = this.getState();
    messageIds.forEach((messageId) => {
      const message = selectMessageById(state, contactId, messageId);
      if (message && message.status === "sent") {
        store.dispatch(
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
    store.dispatch(
      updateMessage({ contactId, messageId, updates: { status } }),
    );
  }

  toggleStarMessage(contactId: string, messageId: string): void {
    const state = this.getState();
    const message = selectMessageById(state, contactId, messageId);
    if (message) {
      const starredMessage = toggleStarMessage(message);
      store.dispatch(
        updateMessage({
          contactId,
          messageId,
          updates: { isStarred: starredMessage.isStarred },
        }),
      );
      store.dispatch(toggleStarMessageAction({ contactId, messageId }));
    }
  }

  getStarredMessages(): Message[] {
    return selectStarredMessages(this.getState());
  }

  searchMessages(query: string, contactId?: string): Message[] {
    const state = this.getState();
    const results = selectSearchMessages(state, query, contactId);
    store.dispatch(setSearchResults(results));
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
    store.dispatch(setTyping({ contactId, isTyping }));
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
