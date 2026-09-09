import Foundation

struct FeedPage: Codable {
  let entries: [FeedEntry]?
  let posts: [FeedPost]?
  let nextPageToken: String?
  let next_page_token: String?

  var token: String? { nextPageToken ?? next_page_token }
}

struct FeedEntry: Codable, Identifiable {
  var id: String { postId }
  let postId: String
  let post: FeedPost?
  let isSponsored: Bool?
}

struct FeedPost: Codable, Identifiable, Hashable {
  var id: String { postId ?? idAlt ?? "" }
  let postId: String?
  let idAlt: String?
  let userId: String?
  let authorId: String?
  let caption: String?
  let type: String?
  let mediaUrls: [String]?
  let coverUrl: String?
  let createdAt: String?
  let username: String?
  let avatar: String?
  var likeCount: Int?
  var commentCount: Int?
  var saveCount: Int?
  var isLiked: Bool?
  var isSaved: Bool?

  enum CodingKeys: String, CodingKey {
    case postId, userId, authorId, caption, type, mediaUrls, coverUrl, createdAt
    case username, avatar, likeCount, commentCount, saveCount, isLiked, isSaved
    case idAlt = "id"
  }

  var authorKey: String? { userId ?? authorId }

  var displayName: String {
    DisplayName.user(username, userId: authorKey)
  }

  var isVideo: Bool {
    let t = (type ?? "").uppercased()
    if t == "VIDEO" || t == "REEL" { return true }
    return (mediaUrls ?? []).contains { MediaURL.isVideo($0) }
  }

  var displayMediaURL: String? {
    if isVideo, let cover = coverUrl, !cover.isEmpty { return cover }
    if let first = mediaUrls?.first(where: { !MediaURL.isVideo($0) && !$0.isEmpty }) {
      return first
    }
    return mediaUrls?.first ?? coverUrl
  }
}

struct EngagementResult: Codable {
  let postId: String?
  let likeCount: Int?
  let commentCount: Int?
  let saveCount: Int?
  let isLiked: Bool?
  let isSaved: Bool?
}

struct CommentPage: Codable {
  let comments: [PostComment]?
}

struct PostComment: Codable, Identifiable, Hashable {
  let id: String
  let postId: String?
  let userId: String?
  let authorId: String?
  let username: String?
  let avatar: String?
  let content: String
  let createdAt: String?

  var authorKey: String? { authorId ?? userId }
  var displayName: String { DisplayName.user(username, userId: authorKey) }
}

struct StatusPage: Codable {
  let statuses: [UserStatusItem]?
}

struct UserStatusItem: Codable, Identifiable, Hashable {
  let id: String
  let userId: String?
  let authorId: String?
  let username: String?
  let avatar: String?
  let content: String?
  let mediaUrl: String?
  let statusType: String?

  var authorKey: String? { authorId ?? userId }
  var displayName: String { DisplayName.user(username, userId: authorKey) }
}

struct CreatePostBody: Encodable {
  let caption: String?
  let type: String
  let mediaUrls: [String]?
  let coverUrl: String?
}

struct CommentBody: Encodable {
  let content: String
}
