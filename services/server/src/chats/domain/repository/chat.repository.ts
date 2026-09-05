import { Chat } from "../chat.entity";

export interface ChatRepository {
  findById(id: string): Promise<Chat | null>;
  touchUpdatedAt(chatId: string): Promise<void>;
}
