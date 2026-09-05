import React from "react";
import { render, cleanup } from "@testing-library/react-native";
import { ThemeProvider } from "@/shared/theme";
import { ChatListItem } from "../ChatListItem";
import { Chat, ChatType, ChatEntity } from "@/chat/chat.model";

jest.mock("../ChatAvatar", () => ({
  ChatAvatar: ({ name, size }: { name: string; size: number }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, null, `Avatar(${name}, ${size})`);
  },
}));

const createMockChat = (overrides?: Partial<Chat>): Chat => {
  return new ChatEntity({
    id: "chat-1",
    name: "John Doe",
    type: ChatType.Individual,
    participantIds: ["user-1"],
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    adminIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("ChatListItem", () => {
  afterEach(cleanup);

  describe("Rendering", () => {
    it("renders chat name correctly", () => {
      const chat = createMockChat({ name: "Alice Smith" });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Alice Smith")).toBeTruthy();
    });

    it("renders avatar component", () => {
      const chat = createMockChat({ name: "Bob Wilson" });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Avatar(Bob Wilson, 56)")).toBeTruthy();
    });

    it("renders with all required elements", () => {
      const chat = createMockChat({
        name: "Test Chat",
        lastMessageContent: "Test message",
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Test Chat")).toBeTruthy();
      expect(getByText("Test message")).toBeTruthy();
    });
  });

  describe("Badge display", () => {
    it("shows badge when unread count is greater than 0", () => {
      const chat = createMockChat({ unreadCount: 5 });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("5")).toBeTruthy();
    });

    it("shows 99+ when unread count exceeds 99", () => {
      const chat = createMockChat({ unreadCount: 150 });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("99+")).toBeTruthy();
    });

    it("does not show badge when unread count is 0", () => {
      const chat = createMockChat({ unreadCount: 0 });
      const onPress = jest.fn();
      const { queryByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(queryByText("0")).toBeNull();
    });

    it("handles various unread count values", () => {
      const chat = createMockChat({ unreadCount: 42 });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("42")).toBeTruthy();
    });
  });

  describe("Subtitle (last message display)", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-06-15T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("shows last message content when available", () => {
      const chat = createMockChat({
        lastMessageContent: "Hello World",
        lastMessageTime: new Date("2024-06-15T11:30:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("shows time when no message content is available", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-06-15T03:30:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("11:30")).toBeTruthy();
    });

    it("shows Yesterday when message is from previous day", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-06-14T10:00:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Yesterday")).toBeTruthy();
    });

    it("shows days ago format for messages within a week", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-06-12T10:00:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("3 days ago")).toBeTruthy();
    });

    it("shows date format for messages older than a month", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-04-10T10:00:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("4/10")).toBeTruthy();
    });

    it("shows Active now for very recent messages", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-06-15T11:59:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Active now")).toBeTruthy();
    });

    it("handles chat without lastMessageTime gracefully", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: undefined,
      });
      const onPress = jest.fn();
      const { queryByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(queryByText("Active now")).toBeNull();
      expect(queryByText("Yesterday")).toBeNull();
    });

    it("shows Last week for messages from about a week ago", () => {
      const chat = createMockChat({
        lastMessageContent: undefined,
        lastMessageTime: new Date("2024-06-08T10:00:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Last week")).toBeTruthy();
    });

    it("handles empty lastMessageContent string", () => {
      const chat = createMockChat({
        lastMessageContent: "   ",
        lastMessageTime: new Date("2024-06-15T03:30:00Z"),
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("11:30")).toBeTruthy();
    });

    it("handles future timestamps gracefully", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const chat = createMockChat({
        lastMessageContent: "Test",
        lastMessageTime: futureDate,
      });
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <ChatListItem chat={chat} onPress={onPress} />,
      );
      expect(getByText("Test")).toBeTruthy();
    });
  });
});
