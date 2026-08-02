import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { MessageBubble } from "../MessageBubble";
import {
  Message,
  MessageType,
  MessageStatus,
  MessageEntity,
} from "@/chat/message.model";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const createMockMessage = (overrides?: Partial<Message>): Message => {
  return new MessageEntity({
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-1",
    senderName: "John Doe",
    content: "Hello World",
    type: MessageType.Text,
    status: MessageStatus.Sent,
    timestamp: new Date("2024-06-15T12:00:00Z"),
    isForwarded: false,
    forwardedFrom: [],
    ...overrides,
  });
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("MessageBubble", () => {
  afterEach(cleanup);

  describe("Rendering", () => {
    it("renders text message content", () => {
      const message = createMockMessage({ content: "Test message" });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("Test message")).toBeTruthy();
    });

    it("renders sender name when showSenderName is true", () => {
      const message = createMockMessage({
        senderName: "Alice",
        content: "Hi there",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={false} showSenderName={true} />,
      );
      expect(getByText("Alice")).toBeTruthy();
    });

    it("does not show sender name for own messages", () => {
      const message = createMockMessage({
        senderName: "Alice",
        content: "Hi there",
      });
      const { queryByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} showSenderName={true} />,
      );
      expect(queryByText("Alice")).toBeNull();
    });
  });

  describe("Message status icons", () => {
    it("shows checkmark for sent status", () => {
      const message = createMockMessage({ status: MessageStatus.Sent });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("shows checkmark-done for delivered status", () => {
      const message = createMockMessage({ status: MessageStatus.Delivered });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("shows checkmark-done for read status", () => {
      const message = createMockMessage({ status: MessageStatus.Read });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("shows alert for failed status", () => {
      const message = createMockMessage({ status: MessageStatus.Failed });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("does not show status icon for other user messages", () => {
      const message = createMockMessage({ status: MessageStatus.Sent });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={false} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Message type rendering", () => {
    it("renders image message", () => {
      const message = createMockMessage({
        type: MessageType.Image,
        content: "https://example.com/image.jpg",
      });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders video message", () => {
      const message = createMockMessage({
        type: MessageType.Video,
        content: "https://example.com/video.mp4",
        duration: 120,
      });
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("renders audio message", () => {
      const message = createMockMessage({
        type: MessageType.Audio,
        duration: 45,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("音频文件")).toBeTruthy();
    });

    it("renders voice message", () => {
      const message = createMockMessage({
        type: MessageType.Voice,
        duration: 30,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("语音消息")).toBeTruthy();
    });

    it("renders file message", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "document.pdf",
        fileSize: 1024 * 500,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("document.pdf")).toBeTruthy();
    });

    it("renders location message", () => {
      const message = createMockMessage({
        type: MessageType.Location,
        locationName: "Central Park",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("Central Park")).toBeTruthy();
    });

    it("renders system message", () => {
      const message = createMockMessage({
        type: MessageType.System,
        content: "User joined the chat",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("User joined the chat")).toBeTruthy();
    });
  });

  describe("Reply indicator", () => {
    it("shows reply content when replyToId exists", () => {
      const message = createMockMessage({
        replyToId: "original-msg",
        replyToContent: "Original message content",
        content: "This is a reply",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("回复")).toBeTruthy();
      expect(getByText("Original message content")).toBeTruthy();
    });

    it("does not show reply when no replyToId", () => {
      const message = createMockMessage({
        content: "Regular message",
      });
      const { queryByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(queryByText("回复")).toBeNull();
    });
  });

  describe("Interaction", () => {
    it("calls onTap when message is tapped", () => {
      const message = createMockMessage();
      const onTap = jest.fn();
      const { UNSAFE_getAllByType } = renderWithProviders(
        <MessageBubble message={message} isMe={true} onTap={onTap} />,
      );
      const { TouchableOpacity } = require("react-native");
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(onTap).not.toHaveBeenCalled();
    });

    it("calls onLongPress when message is long pressed", () => {
      const message = createMockMessage();
      const onLongPress = jest.fn();
      renderWithProviders(
        <MessageBubble
          message={message}
          isMe={true}
          onLongPress={onLongPress}
        />,
      );
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe("Time formatting", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("formats time correctly for today messages", () => {
      const message = createMockMessage({
        timestamp: new Date("2024-06-15T10:30:00Z"),
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("18:30")).toBeTruthy();
    });

    it("formats time with date for older messages", () => {
      const message = createMockMessage({
        timestamp: new Date("2024-06-10T10:30:00Z"),
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("6/10 18:30")).toBeTruthy();
    });
  });

  describe("Duration formatting", () => {
    it("formats duration correctly", () => {
      const message = createMockMessage({
        type: MessageType.Video,
        duration: 90,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("01:30")).toBeTruthy();
    });

    it("shows 00:00 when no duration", () => {
      const message = createMockMessage({
        type: MessageType.Audio,
        duration: undefined,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("00:00")).toBeTruthy();
    });
  });

  describe("File size formatting", () => {
    it("formats bytes", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "small.txt",
        fileSize: 500,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("500 B")).toBeTruthy();
    });

    it("formats kilobytes", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "doc.txt",
        fileSize: 1024 * 50,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("50.0 KB")).toBeTruthy();
    });

    it("formats megabytes", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "large.pdf",
        fileSize: 1024 * 1024 * 2.5,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("2.5 MB")).toBeTruthy();
    });

    it("formats gigabytes", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "video.mp4",
        fileSize: 1024 * 1024 * 1024 * 1.2,
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("1.2 GB")).toBeTruthy();
    });

    it("shows unknown size when no fileSize", () => {
      const message = createMockMessage({
        type: MessageType.File,
        fileName: "unknown.txt",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(getByText("未知大小")).toBeTruthy();
    });
  });

  describe("Positioning", () => {
    it("aligns own messages to right", () => {
      const message = createMockMessage();
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={true} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it("aligns other messages to left", () => {
      const message = createMockMessage();
      const { UNSAFE_root } = renderWithProviders(
        <MessageBubble message={message} isMe={false} />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe("Avatar display", () => {
    it("shows avatar when showAvatar is true and isMe is false", () => {
      const message = createMockMessage({
        senderName: "Bob",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={false} showAvatar={true} />,
      );
      expect(getByText("B")).toBeTruthy();
    });

    it("does not show avatar for own messages", () => {
      const message = createMockMessage({
        senderName: "Me",
      });
      const { queryByText } = renderWithProviders(
        <MessageBubble message={message} isMe={true} showAvatar={true} />,
      );
      expect(queryByText("M")).toBeNull();
    });

    it("shows default avatar letter", () => {
      const message = createMockMessage({
        senderName: "Zara",
      });
      const { getByText } = renderWithProviders(
        <MessageBubble message={message} isMe={false} showAvatar={true} />,
      );
      expect(getByText("Z")).toBeTruthy();
    });
  });
});
