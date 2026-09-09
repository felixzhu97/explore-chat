import SwiftUI

struct FeedPostCardView: View {
  let post: FeedPost
  var onLike: () -> Void
  var onSave: () -> Void
  var onComment: () -> Void
  var onShare: () -> Void
  var onOpenMedia: () -> Void
  var onOpenUser: () -> Void

  private var displayName: String { post.displayName }

  private var mediaURLs: [String] {
    (post.mediaUrls ?? []).filter { !$0.isEmpty }
  }

  private var hasMedia: Bool {
    post.displayMediaURL != nil || !mediaURLs.isEmpty || (post.coverUrl?.isEmpty == false)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      mediaBlock
      actionsRow
      footer
    }
    .background(AppTheme.pageBackground)
    .padding(.bottom, 18)
  }

  @ViewBuilder
  private var mediaBlock: some View {
    ZStack(alignment: .top) {
      Group {
        if hasMedia, let raw = post.displayMediaURL, let url = MediaURL.resolve(raw) {
          AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
              image.resizable().scaledToFill()
            default:
              Color.black.opacity(0.85)
                .overlay { ProgressView().tint(.white) }
            }
          }
          .overlay(alignment: .bottomTrailing) {
            if post.isVideo {
              Image(systemName: "play.circle.fill")
                .font(.system(size: 28))
                .foregroundStyle(.white.opacity(0.9))
                .padding(12)
            }
          }
        } else {
          LinearGradient(
            colors: [Color(hex: 0x1C1C1E), Color(hex: 0x3A3A3C)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
          .overlay(alignment: .bottomLeading) {
            if let caption = post.caption, !caption.isEmpty {
              Text(caption)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .padding(20)
            }
          }
        }
      }
      .frame(maxWidth: .infinity)
      .frame(height: UIScreen.main.bounds.width * 1.25)
      .clipped()
      .contentShape(Rectangle())
      .highPriorityGesture(
        TapGesture(count: 2).onEnded { onLike() }
      )
      .onTapGesture { onOpenMedia() }

      HStack(spacing: 8) {
        Button(action: onOpenUser) {
          HStack(spacing: 8) {
            AsyncAvatar(urlString: post.avatar, size: 32)
            VStack(alignment: .leading, spacing: 1) {
              Text(displayName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
              if let created = post.createdAt {
                Text(relativeTime(created))
                  .font(.system(size: 11))
                  .foregroundStyle(.white.opacity(0.92))
              }
            }
          }
        }
        .buttonStyle(.plain)
        Spacer()
        Image(systemName: "ellipsis")
          .foregroundStyle(.white)
          .font(.system(size: 16, weight: .semibold))
      }
      .padding(.horizontal, 12)
      .padding(.top, 10)
      .shadow(color: .black.opacity(0.35), radius: 4, y: 1)
    }
  }

  private var actionsRow: some View {
    HStack {
      HStack(spacing: 14) {
        Button(action: onLike) {
          Image(systemName: post.isLiked == true ? "heart.fill" : "heart")
            .font(.system(size: 22))
            .foregroundStyle(post.isLiked == true ? AppTheme.likeRed : AppTheme.primaryText)
        }
        Button(action: onComment) {
          Image(systemName: "bubble.right")
            .font(.system(size: 21))
            .foregroundStyle(AppTheme.primaryText)
        }
        Button(action: onShare) {
          Image(systemName: "paperplane")
            .font(.system(size: 21))
            .foregroundStyle(AppTheme.primaryText)
        }
      }
      Spacer()
      Button(action: onSave) {
        Image(systemName: post.isSaved == true ? "bookmark.fill" : "bookmark")
          .font(.system(size: 21))
          .foregroundStyle(AppTheme.primaryText)
      }
    }
    .buttonStyle(.plain)
    .padding(.horizontal, 12)
    .padding(.top, 10)
    .padding(.bottom, 4)
  }

  private var footer: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("\(post.likeCount ?? 0) likes")
        .font(.system(size: 13, weight: .semibold))
      if hasMedia, let caption = post.caption, !caption.isEmpty {
        (
          Text(displayName).font(.system(size: 13, weight: .semibold))
            + Text(" \(caption)").font(.system(size: 13))
        )
        .foregroundStyle(AppTheme.primaryText)
      }
      if (post.commentCount ?? 0) > 0 {
        Button(action: onComment) {
          Text("View all \(post.commentCount ?? 0) comments")
            .font(.system(size: 13))
            .foregroundStyle(AppTheme.secondaryText)
        }
        .buttonStyle(.plain)
      }
      if let created = post.createdAt {
        Text(relativeTime(created))
          .font(.system(size: 11))
          .foregroundStyle(AppTheme.secondaryText)
          .padding(.top, 2)
      }
    }
    .foregroundStyle(AppTheme.primaryText)
    .padding(.horizontal, 12)
    .padding(.bottom, 4)
  }

  private func relativeTime(_ value: String) -> String {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    var date = formatter.date(from: value)
    if date == nil {
      formatter.formatOptions = [.withInternetDateTime]
      date = formatter.date(from: value)
    }
    guard let date else { return value }
    let mins = Int(Date().timeIntervalSince(date) / 60)
    if mins < 1 { return "now" }
    if mins < 60 { return "\(mins)m" }
    let hours = mins / 60
    if hours < 24 { return "\(hours)h" }
    let days = hours / 24
    if days < 7 { return "\(days)d" }
    return "\(days / 7)w"
  }
}
