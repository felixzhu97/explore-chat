import Foundation

enum L10n {
  static func t(_ key: String, language: String) -> String {
    let table: [String: [String: String]] = [
      "app_name": ["en": "Chat", "zh-Hans": "Chat"],
      "login": ["en": "Sign In", "zh-Hans": "登录"],
      "register": ["en": "Create Account", "zh-Hans": "注册"],
      "email": ["en": "Email", "zh-Hans": "邮箱"],
      "password": ["en": "Password", "zh-Hans": "密码"],
      "username": ["en": "Username", "zh-Hans": "用户名"],
      "feed": ["en": "Feed", "zh-Hans": "信息流"],
      "reels": ["en": "Reels", "zh-Hans": "Reels"],
      "chats": ["en": "Chats", "zh-Hans": "聊天"],
      "search": ["en": "Search", "zh-Hans": "搜索"],
      "profile": ["en": "Profile", "zh-Hans": "主页"],
      "settings": ["en": "Settings", "zh-Hans": "设置"],
      "notifications": ["en": "Notifications", "zh-Hans": "通知"],
      "logout": ["en": "Sign Out", "zh-Hans": "退出登录"],
      "send": ["en": "Send", "zh-Hans": "发送"],
      "follow": ["en": "Follow", "zh-Hans": "关注"],
      "following": ["en": "Following", "zh-Hans": "已关注"],
      "create_post": ["en": "New Post", "zh-Hans": "发帖"],
      "comments": ["en": "Comments", "zh-Hans": "评论"],
      "share": ["en": "Share", "zh-Hans": "分享"],
      "media": ["en": "Media", "zh-Hans": "媒体"],
      "status": ["en": "Status", "zh-Hans": "状态"],
      "inbox": ["en": "Inbox", "zh-Hans": "收件箱"],
      "chat": ["en": "Chat", "zh-Hans": "聊天"],
      "answer": ["en": "Answer", "zh-Hans": "接听"],
      "reject": ["en": "Reject", "zh-Hans": "拒绝"],
      "end_call": ["en": "End", "zh-Hans": "挂断"]
    ]
    let lang = language.hasPrefix("zh") ? "zh-Hans" : "en"
    return table[key]?[lang] ?? key
  }
}
