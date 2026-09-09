import Foundation

struct ChatListResponse: Codable {
  let chats: [ChatSummary]?
}

struct ChatSummary: Codable, Identifiable, Hashable {
  let id: String
  let name: String?
  let type: String?
  let avatar: String?
  let isArchived: Bool?
  let isMuted: Bool?
  let updatedAt: String?
  let lastMessage: MessageDTO?
}

struct MessagePage: Codable {
  let messages: [MessageDTO]?
  let nextPageToken: String?
  let next_page_token: String?
}

struct MessageDTO: Codable, Identifiable, Hashable {
  let id: String
  let chatId: String?
  let senderId: String?
  let type: String?
  let content: String?
  let createdAt: String?
  let clientMsgId: String?
}

struct SendMessageBody: Encodable {
  let content: String
  let type: String
  let clientMsgId: String
}

struct CreateChatBody: Encodable {
  let peerUserId: String
}
