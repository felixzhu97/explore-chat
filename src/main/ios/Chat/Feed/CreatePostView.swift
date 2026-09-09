import SwiftUI
import PhotosUI

struct CreatePostView: View {
  @EnvironmentObject private var environment: AppEnvironment
  @EnvironmentObject private var settings: SettingsStore
  @Environment(\.dismiss) private var dismiss
  @State private var caption = ""
  @State private var pickerItem: PhotosPickerItem?
  @State private var imageData: Data?
  @State private var errorMessage: String?
  @State private var isSubmitting = false

  var body: some View {
    Form {
      TextField("Caption", text: $caption, axis: .vertical)
      PhotosPicker(selection: $pickerItem, matching: .images) {
        Label("Choose Photo", systemImage: "photo")
      }
      .onChange(of: pickerItem) { _, item in
        Task {
          imageData = try? await item?.loadTransferable(type: Data.self)
        }
      }
      if let imageData, let ui = UIImage(data: imageData) {
        Image(uiImage: ui).resizable().scaledToFit().frame(maxHeight: 200)
      }
      if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
      Button("Post") { Task { await submit() } }
        .disabled(isSubmitting)
    }
    .navigationTitle(L10n.t("create_post", language: settings.languageCode))
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .cancellationAction) {
        Button("Close") { dismiss() }
      }
    }
  }

  private func submit() async {
    isSubmitting = true
    errorMessage = nil
    defer { isSubmitting = false }
    do {
      var mediaUrls: [String] = []
      var type = "TEXT"
      if let imageData {
        let uploaded = try await environment.api.upload(
          path: "media/upload",
          fileData: imageData,
          fileName: "post.jpg",
          mimeType: "image/jpeg"
        )
        mediaUrls = [uploaded.url]
        type = "IMAGE"
      }
      let _: FeedPost = try await environment.api.post(
        "posts",
        body: CreatePostBody(caption: caption, type: type, mediaUrls: mediaUrls.isEmpty ? nil : mediaUrls, coverUrl: mediaUrls.first)
      )
      environment.analytics.track("post_create")
      dismiss()
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
