import SwiftUI

struct AsyncAvatar: View {
  let urlString: String?
  var size: CGFloat = 40

  var body: some View {
    Group {
      if let url = MediaURL.resolve(urlString) {
        AsyncImage(url: url) { phase in
          switch phase {
          case .success(let image):
            image.resizable().scaledToFill()
          default:
            placeholder
          }
        }
      } else {
        placeholder
      }
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
  }

  private var placeholder: some View {
    ZStack {
      Circle().fill(Color(hex: 0xEFEFEF))
      Image(systemName: "person.fill")
        .font(.system(size: size * 0.42))
        .foregroundStyle(AppTheme.secondaryText)
    }
  }
}
