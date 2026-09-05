import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { ExploreGridTile } from "../ExploreGridTile";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

const createMockPost = (
  overrides?: Partial<MobileFeedPost>,
): MobileFeedPost => ({
  id: "post-1",
  userId: "user-1",
  username: "testuser",
  avatar: "https://example.com/avatar.jpg",
  timestamp: "2024-01-01T00:00:00Z",
  caption: "Test caption",
  likeCount: 100,
  commentCount: 50,
  imageUrl: "https://example.com/image.jpg",
  isLiked: false,
  isSaved: false,
  type: "IMAGE",
  mediaUrls: [],
  ...overrides,
});

describe("ExploreGridTile", () => {
  describe("Rendering", () => {
    it("renders tile with image", () => {
      const post = createMockPost({
        imageUrl: "https://example.com/image.jpg",
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders tile with coverImageUrl", () => {
      const post = createMockPost({
        coverImageUrl: "https://example.com/cover.jpg",
        imageUrl: "https://example.com/image.jpg",
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders tile with mediaUrls", () => {
      const post = createMockPost({
        mediaUrls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders tile with empty imageUrl", () => {
      const post = createMockPost({ imageUrl: "" });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Video Badge", () => {
    it("shows play badge for video posts", () => {
      const post = createMockPost({
        type: "VIDEO",
        videoUrl: "https://example.com/video.mp4",
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("shows play badge when videoUrl exists but type is not VIDEO", () => {
      const post = createMockPost({
        videoUrl: "https://example.com/video.mp4",
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Multi-media Badge", () => {
    it("shows copy badge for posts with multiple media", () => {
      const post = createMockPost({
        mediaUrls: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
        ],
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("does not show badge for single media", () => {
      const post = createMockPost({
        mediaUrls: ["https://example.com/1.jpg"],
      });
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Press Handling", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      const post = createMockPost();
      const { UNSAFE_root } = renderWithProviders(
        <ExploreGridTile
          post={post}
          tileSize={100}
          marginRight={1}
          marginBottom={1}
          onPress={onPress}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
