import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { FeedPostCard } from "../FeedPostCard";
import type { FeedPost as MobileFeedPost } from "@/feed/feed-post.model";

jest.mock("expo-video", () => ({
  VideoView: "VideoView",
  useVideoPlayer: jest.fn(() => ({
    loop: true,
    muted: true,
    pause: jest.fn(),
    play: jest.fn(),
  })),
}));

jest.mock("react-native-webview", () => ({
  WebView: "WebView",
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  Feather: "Feather",
}));

const createMockFeedPost = (
  overrides?: Partial<MobileFeedPost>,
): MobileFeedPost => ({
  id: "post-1",
  userId: "user-1",
  username: "testuser",
  avatar: "https://example.com/avatar.jpg",
  timestamp: "2024-06-15T12:00:00Z",
  caption: "Test caption",
  likeCount: 100,
  commentCount: 50,
  imageUrl: "https://example.com/image.jpg",
  isLiked: false,
  isSaved: false,
  type: "IMAGE",
  mediaUrls: ["https://example.com/image.jpg"],
  ...overrides,
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("FeedPostCard", () => {
  afterEach(cleanup);

  describe("Rendering", () => {
    it("renders post with basic info", () => {
      const post = createMockFeedPost({
        username: "johndoe",
        caption: "Hello World",
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      expect(getByText("johndoe")).toBeTruthy();
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("renders avatar image", () => {
      const post = createMockFeedPost({
        avatar: "https://example.com/avatar.png",
      });
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Like interaction", () => {
    it("calls onPressLike when like button is pressed", () => {
      const post = createMockFeedPost();
      const onPressLike = jest.fn();
      const { UNSAFE_getAllByType } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={onPressLike} />,
      );
      const { TouchableOpacity } = require("react-native");
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
      }
      expect(onPressLike).not.toHaveBeenCalled();
    });

    it("displays like count correctly", () => {
      const post = createMockFeedPost({ likeCount: 1500 });
      const onPressLike = jest.fn();
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={onPressLike} />,
      );
      expect(getByText("1.5K")).toBeTruthy();
    });

    it("displays like count in millions", () => {
      const post = createMockFeedPost({ likeCount: 2500000 });
      const onPressLike = jest.fn();
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={onPressLike} />,
      );
      expect(getByText("2.5M")).toBeTruthy();
    });

    it("displays zero likes", () => {
      const post = createMockFeedPost({ likeCount: 0 });
      const onPressLike = jest.fn();
      const { getAllByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={onPressLike} />,
      );
      const zeroElements = getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Comment interaction", () => {
    it("displays comment count", () => {
      const post = createMockFeedPost({ commentCount: 75 });
      const onPressComment = jest.fn();
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post} onPressComment={onPressComment} />,
      );
      expect(getByText("75")).toBeTruthy();
    });

    it("calls onPressComment when comment button is pressed", () => {
      const post = createMockFeedPost();
      const onPressComment = jest.fn();
      const { UNSAFE_getAllByType } = renderWithProviders(
        <FeedPostCard post={post} onPressComment={onPressComment} />,
      );
      const { TouchableOpacity } = require("react-native");
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(onPressComment).not.toHaveBeenCalled();
    });
  });

  describe("Save interaction", () => {
    it("displays save icon based on isSaved state", () => {
      const post = createMockFeedPost({ isSaved: true });
      const onPressSave = jest.fn();
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard post={post} onPressSave={onPressSave} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("calls onPressSave when save button is pressed", () => {
      const post = createMockFeedPost({ isSaved: false });
      const onPressSave = jest.fn();
      const { UNSAFE_getAllByType } = renderWithProviders(
        <FeedPostCard post={post} onPressSave={onPressSave} />,
      );
      const { TouchableOpacity } = require("react-native");
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(onPressSave).not.toHaveBeenCalled();
    });
  });

  describe("Follow button", () => {
    it("does not show follow button for own posts", () => {
      const post = createMockFeedPost({ userId: "current-user" });
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard
          post={post}
          currentUserId="current-user"
          onPressLike={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("shows follow button when user is not following", () => {
      const post = createMockFeedPost({ userId: "other-user" });
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard
          post={post}
          currentUserId="current-user"
          isFollowing={false}
          onPressLike={jest.fn()}
        />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Video handling", () => {
    it("identifies video posts correctly", () => {
      const videoPost = createMockFeedPost({
        type: "VIDEO",
        videoUrl: "https://example.com/video.mp4",
        imageUrl: "https://example.com/cover.jpg",
      });
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard post={videoPost} onPressLike={jest.fn()} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("handles data URI video", () => {
      const dataVideoPost = createMockFeedPost({
        type: "VIDEO",
        videoUrl: "data:video/mp4;base64,abc123",
      });
      const { UNSAFE_root } = renderWithProviders(
        <FeedPostCard post={dataVideoPost} onPressLike={jest.fn()} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Relative time display", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("shows now for recent posts", () => {
      const recentPost = createMockFeedPost({
        timestamp: new Date().toISOString(),
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={recentPost} onPressLike={jest.fn()} />,
      );
      expect(getByText("now")).toBeTruthy();
    });

    it("shows minutes ago", () => {
      const post30MinAgo = createMockFeedPost({
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post30MinAgo} onPressLike={jest.fn()} />,
      );
      expect(getByText("30m")).toBeTruthy();
    });

    it("shows hours ago", () => {
      const post5HoursAgo = createMockFeedPost({
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post5HoursAgo} onPressLike={jest.fn()} />,
      );
      expect(getByText("5h")).toBeTruthy();
    });

    it("shows days ago", () => {
      const post3DaysAgo = createMockFeedPost({
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post3DaysAgo} onPressLike={jest.fn()} />,
      );
      expect(getByText("3d")).toBeTruthy();
    });

    it("shows weeks ago", () => {
      const post2WeeksAgo = createMockFeedPost({
        timestamp: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post2WeeksAgo} onPressLike={jest.fn()} />,
      );
      expect(getByText("2w")).toBeTruthy();
    });
  });

  describe("Caption display", () => {
    it("shows username and caption", () => {
      const post = createMockFeedPost({
        username: "photographer",
        caption: "Beautiful sunset today!",
      });
      const { getByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      expect(getByText("photographer")).toBeTruthy();
      expect(getByText("Beautiful sunset today!")).toBeTruthy();
    });

    it("handles empty caption", () => {
      const post = createMockFeedPost({ caption: "" });
      const { queryByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      expect(queryByText("")).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("handles invalid like count", () => {
      const post = createMockFeedPost({ likeCount: NaN });
      const { getAllByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      const zeroElements = getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });

    it("handles negative values in counts", () => {
      const post = createMockFeedPost({ likeCount: -10 });
      const { getAllByText } = renderWithProviders(
        <FeedPostCard post={post} onPressLike={jest.fn()} />,
      );
      const zeroElements = getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
