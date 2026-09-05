import { Message } from "../message.entity";

export interface MessageRepository {
  save(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByChatId(
    chatId: string,
    options: { page: number; limit: number; search?: string },
  ): Promise<Message[]>;
}
