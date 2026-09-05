import { Message } from "../model/message";

export interface MessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByChatId(
    chatId: string,
    options: { page: number; limit: number; search?: string },
  ): Promise<Message[]>;
}
