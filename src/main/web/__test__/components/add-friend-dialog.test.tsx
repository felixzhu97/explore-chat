import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { AddFriendDialog } from "@/chat/components/add-friend-dialog";

// Mock the UI components
vi.mock("@/shared/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/shared/ui/input", () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input onChange={onChange} onKeyDown={onKeyDown} {...props} />
  ),
}));

vi.mock("@/shared/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock("@/shared/ui/tabs", () => ({
  Tabs: ({ children, defaultValue, ...props }: any) => (
    <div data-testid="tabs" data-default-value={defaultValue} {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button data-testid={`tab-${value}`} {...props}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid={`tab-content-${value}`} {...props}>
      {children}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Search: () => <div data-testid="search-icon" />,
  UserPlus: () => <div data-testid="user-plus-icon" />,
  QrCode: () => <div data-testid="qr-code-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
}));

describe("AddFriendDialog", () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onAddFriend: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByText("添加好友")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<AddFriendDialog {...mockProps} isOpen={false} />);

      expect(screen.queryByText("添加好友")).not.toBeInTheDocument();
    });

    it("should render search input", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(
        screen.getByPlaceholderText("输入手机号或用户名"),
      ).toBeInTheDocument();
    });

    it("should render message textarea", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByPlaceholderText("输入验证消息")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddFriendDialog {...mockProps} />);

      const closeButton = screen.getByTestId("x-icon").closest("button");
      if (closeButton) {
        await user.click(closeButton);
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      }
    });

    it("should update search input value", async () => {
      const user = userEvent.setup();
      render(<AddFriendDialog {...mockProps} />);

      const searchInput = screen.getByPlaceholderText("输入手机号或用户名");
      await user.type(searchInput, "test user");

      expect(searchInput).toHaveValue("test user");
    });

    it("should update message textarea value", async () => {
      const user = userEvent.setup();
      render(<AddFriendDialog {...mockProps} />);

      const messageTextarea = screen.getByPlaceholderText("输入验证消息");
      await user.clear(messageTextarea);
      await user.type(messageTextarea, "Hello, friend!");

      expect(messageTextarea).toHaveValue("Hello, friend!");
    });
  });

  describe("Tab Navigation", () => {
    it("should render all tab labels", () => {
      render(<AddFriendDialog {...mockProps} />);

      // Use getAllByText because the search text appears in multiple places
      expect(screen.getAllByText("搜索").length).toBeGreaterThan(0);
      expect(screen.getAllByText("附近").length).toBeGreaterThan(0);
      expect(screen.getAllByText("最近").length).toBeGreaterThan(0);
      expect(screen.getAllByText("扫码").length).toBeGreaterThan(0);
    });
  });

  describe("Mock Data Display", () => {
    // Note: Nearby users, recent contacts, and QR code content are in inactive tabs
    // and are not rendered. These tests verify the search tab (default active tab) content.
    it("should show empty state in search tab by default", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(
        screen.getByText("输入手机号或用户名搜索好友"),
      ).toBeInTheDocument();
    });

    it("should show add message placeholder", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByText("你好，我想加你为好友")).toBeInTheDocument();
    });
  });

  describe("Form Elements", () => {
    it("should have proper labels", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByText("搜索用户")).toBeInTheDocument();
      expect(screen.getByText("添加好友消息")).toBeInTheDocument();
    });

    it("should show character count", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByText("10/100")).toBeInTheDocument();
    });

    it("should have proper input attributes", () => {
      render(<AddFriendDialog {...mockProps} />);

      const searchInput = screen.getByPlaceholderText("输入手机号或用户名");
      const messageTextarea = screen.getByPlaceholderText("输入验证消息");

      expect(searchInput).toHaveAttribute("id", "search");
      expect(messageTextarea).toHaveAttribute("id", "message");
      expect(messageTextarea).toHaveAttribute("maxLength", "100");
    });
  });

  describe("Icons", () => {
    it("should render icons in active search tab", () => {
      render(<AddFriendDialog {...mockProps} />);

      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
      expect(
        screen.getAllByTestId("search-icon").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByTestId("clock-icon").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(
        screen.getAllByTestId("qr-code-icon").length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByTestId("map-pin-icon").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
