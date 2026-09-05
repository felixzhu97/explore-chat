import { Chat } from "../model/chat";

export interface ChatRepository {
  findById(id: string): Promise<Chat | null>;
  touchUpdatedAt(chatId: string): Promise<void>;
}
