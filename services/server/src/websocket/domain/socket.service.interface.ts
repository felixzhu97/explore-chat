export interface ISocketService {
  emitToUser(userId: string, event: string, data: any): Promise<void>;
  emitToRoom(roomId: string, event: string, data: any): Promise<void>;
  joinRoom(socketId: string, roomId: string): Promise<void>;
  leaveRoom(socketId: string, roomId: string): Promise<void>;
  disconnectUser(userId: string): Promise<void>;
}
