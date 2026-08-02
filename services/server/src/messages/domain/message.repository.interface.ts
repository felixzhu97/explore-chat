import { Message } from "./message.entity";

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByChatId(
    chatId: string,
    options?: { page?: number; limit?: number; search?: string },
  ): Promise<Message[]>;
  create(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">,
  ): Promise<Message>;
  update(id: string, data: Partial<Message>): Promise<Message>;
  delete(id: string): Promise<void>;
  markAsRead(chatId: string, userId: string): Promise<void>;
}
