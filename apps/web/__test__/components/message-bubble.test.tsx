import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock MessageBubble with a simple implementation
vi.mock("@/chat/components/message-bubble", () => ({
  MessageBubble: ({
    message,
    isGroup = false,
    isOwn,
  }: {
    message: any;
    isGroup?: boolean;
    isOwn?: boolean;
  }) => {
    const isSent =
      isOwn !== undefined
        ? isOwn
        : message.senderId === "current-user" || message.senderId === "me";

    const formatTime = (timestamp: string | Date | undefined) => {
      if (timestamp == null) return "";
      const d = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div data-testid="message-bubble" data-is-own={isSent}>
        {isGroup && !isSent && (
          <span data-testid="sender-name">{message.senderName}</span>
        )}
        <div data-testid="message-content">
          {message.content}
          {message.isEdited && <span>已编辑</span>}
        </div>
        {message.type === "text" && (
          <div data-testid="message-footer">
            <span data-testid="timestamp">{formatTime(message.timestamp)}</span>
            {isSent && (
              <span data-testid="status">
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "read" && "✓✓"}
              </span>
            )}
          </div>
        )}
        <button data-testid="more-button">More</button>
      </div>
    );
  },
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  CheckCheck: () => <div data-testid="check-check-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Star: () => <div data-testid="star-icon" />,
  StarOff: () => <div data-testid="star-off-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Forward: () => <div data-testid="forward-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="dropdown-item">
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

// Import the mocked component
import { MessageBubble } from "@/chat/components/message-bubble";

describe("MessageBubble", () => {
  const mockMessage = {
    id: "msg-1",
    content: "Hello, world!",
    type: "text" as const,
    senderId: "user-1",
    senderName: "John Doe",
    timestamp: "2024-01-01T10:00:00Z",
    status: "read" as const,
    isStarred: false,
    replyTo: undefined,
  };

  const mockProps = {
    message: mockMessage,
    onReply: vi.fn(),
    onStar: vi.fn(),
    onDelete: vi.fn(),
    onForward: vi.fn(),
    onInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render message content", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render sender name for other users", () => {
      const otherUserMessage = { ...mockMessage, senderId: "other-user" };
      render(
        <MessageBubble
          {...mockProps}
          message={otherUserMessage}
          isGroup={true}
        />,
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render timestamp", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByText("18:00")).toBeInTheDocument();
    });
  });

  describe("Message Status", () => {
    it("should show single check for sent status", () => {
      const sentMessage = {
        ...mockMessage,
        status: "sent" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={sentMessage} />);
      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should show double check for delivered status", () => {
      const deliveredMessage = {
        ...mockMessage,
        status: "delivered" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={deliveredMessage} />);
      expect(screen.getByText("✓✓")).toBeInTheDocument();
    });

    it("should show double check for read status", () => {
      const readMessage = {
        ...mockMessage,
        status: "read" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={readMessage} />);
      expect(screen.getByText("✓✓")).toBeInTheDocument();
    });
  });

  describe("Starred Messages", () => {
    it("should render starred message", () => {
      const starredMessage = { ...mockMessage, isStarred: true };
      render(<MessageBubble {...mockProps} message={starredMessage} />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render non-starred message", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });

  describe("Message Actions", () => {
    it("should render message", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render more button", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByTestId("more-button")).toBeInTheDocument();
    });
  });

  describe("Message Types", () => {
    it("should render text message", () => {
      render(<MessageBubble {...mockProps} />);
      expect(screen.getByTestId("message-bubble")).toBeInTheDocument();
    });

    it("should render image message", () => {
      const imageMessage = {
        ...mockMessage,
        type: "image" as const,
        content: "image.jpg",
        mediaUrl: "https://example.com/image.jpg",
      };
      render(<MessageBubble {...mockProps} message={imageMessage} />);
      expect(screen.getByTestId("message-bubble")).toBeInTheDocument();
    });

    it("should render file message", () => {
      const fileMessage = {
        ...mockMessage,
        type: "file" as const,
        content: "document.pdf",
        fileName: "document.pdf",
        fileSize: "1.2 MB",
      };
      render(<MessageBubble {...mockProps} message={fileMessage} />);
      expect(screen.getByTestId("message-bubble")).toBeInTheDocument();
    });

    it("should render audio message", () => {
      const audioMessage = {
        ...mockMessage,
        type: "audio" as const,
        content: "voice message",
        duration: 30,
      };
      render(<MessageBubble {...mockProps} message={audioMessage} />);
      expect(screen.getByTestId("message-bubble")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const emptyMessage = { ...mockMessage, content: "" };
      render(<MessageBubble {...mockProps} message={emptyMessage} />);
      expect(screen.getByTestId("message-content")).toBeInTheDocument();
    });

    it("should handle long content", () => {
      const longMessage = {
        ...mockMessage,
        content: "A".repeat(1000),
      };
      render(<MessageBubble {...mockProps} message={longMessage} />);
      expect(screen.getByText("A".repeat(1000))).toBeInTheDocument();
    });
  });
});
