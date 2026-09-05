export interface ApiMessageLike {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  clientMsgId?: string;
}

export interface SocketMessagePayload {
  from?: string;
  to?: string;
  data?: { id?: string; text?: string; type?: string; clientMsgId?: string };
  timestamp?: number;
}
