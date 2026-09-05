import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatHeader } from "@/chat/components/chat-header";
import type { Contact } from "@/shared/types";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Info: vi.fn(() =>
    React.createElement("span", { "data-testid": "info-icon" }, "Info"),
  ),
  Users: vi.fn(() =>
    React.createElement("span", { "data-testid": "users-icon" }, "Users"),
  ),
  BellOff: vi.fn(() =>
    React.createElement("span", { "data-testid": "bell-off-icon" }, "BellOff"),
  ),
}));

// Mock UI components
vi.mock("@/shared/ui/avatar", () => ({
  Avatar: vi.fn(({ children }) =>
    React.createElement("div", { "data-testid": "avatar" }, children),
  ),
  AvatarImage: vi.fn(({ src, ...props }) =>
    React.createElement("img", {
      "data-testid": "avatar-image",
      src,
      ...props,
    }),
  ),
  AvatarFallback: vi.fn(({ children, ...props }) =>
    React.createElement(
      "span",
      { "data-testid": "avatar-fallback", ...props },
      children,
    ),
  ),
}));

vi.mock("@/shared/ui/button", () => ({
  Button: vi.fn(({ children, ...props }) =>
    React.createElement(
      "button",
      { "data-testid": "button", ...props },
      children,
    ),
  ),
}));

// Mock emotion styled
vi.mock("@/src/shared/utils/emotion", () => {
  // Create a styled component wrapper that properly handles React components
  const createStyledComponent = (component: any) => {
    // styled(Component) pattern - component is a React component
    return (strings: any, ...values: any[]) => {
      // Return a functional component that renders the original with children
      const StyledComponent = (props: any) => {
        const { children, ...restProps } = props;
        return React.createElement(component, restProps, children);
      };
      return StyledComponent;
    };
  };

  // Create a styled element wrapper for HTML elements like styled.div
  const styledElement = (element: string) => {
    return (strings: any, ...values: any[]) => {
      const StyledElement = (props: any) => {
        const { children, ...restProps } = props;
        return React.createElement(element, restProps, children);
      };
      return StyledElement;
    };
  };

  // Create styled function with both element shortcuts and callable pattern
  const styled: any = (component: any) => {
    // If called as styled(Component), use component pattern
    if (
      typeof component === "function" ||
      (typeof component === "object" && component !== null)
    ) {
      return createStyledComponent(component);
    }
    // If called as styled('div'), styled('span'), etc
    return styledElement(component);
  };

  // Add HTML element shortcuts
  styled.div = styledElement("div");
  styled.span = styledElement("span");
  styled.button = styledElement("button");
  styled.p = styledElement("p");
  styled.img = styledElement("img");
  styled.input = styledElement("input");
  styled.ul = styledElement("ul");
  styled.li = styledElement("li");
  styled.form = styledElement("form");
  styled.label = styledElement("label");
  styled.nav = styledElement("nav");
  styled.section = styledElement("section");
  styled.article = styledElement("article");
  styled.aside = styledElement("aside");
  styled.header = styledElement("header");
  styled.footer = styledElement("footer");
  styled.main = styledElement("main");
  styled.a = styledElement("a");
  styled.svg = styledElement("svg");

  return {
    styled,
    keyframes: vi.fn(() => () => ""),
    css: vi.fn(),
    useTheme: vi.fn(() => ({})),
    instagramListRowColors: {},
    instagramShadows: {},
  };
});

describe("ChatHeader Component", () => {
  const mockContact: Contact = {
    id: "contact-1",
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    lastMessage: "Hello",
    timestamp: "2024-01-15T10:30:00Z",
    isOnline: true,
    isGroup: false,
  };

  const defaultProps = {
    contact: mockContact,
    isTyping: false,
    isGroup: false,
    onVoiceCall: vi.fn(),
    onVideoCall: vi.fn(),
    onShowInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render contact name", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render avatar", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("should render info button", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });
  });

  describe("contact display", () => {
    it("should display single contact name correctly", () => {
      render(<ChatHeader {...defaultProps} isGroup={false} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display group name for group chat", () => {
      const groupContact = {
        ...mockContact,
        isGroup: true,
        name: "Test Group",
      };
      render(
        <ChatHeader {...defaultProps} contact={groupContact} isGroup={true} />,
      );
      expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    it("should show group icon for group chats", () => {
      const groupContact = {
        ...mockContact,
        isGroup: true,
      };
      render(
        <ChatHeader {...defaultProps} contact={groupContact} isGroup={true} />,
      );
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("should not show group icon for individual chats", () => {
      render(<ChatHeader {...defaultProps} isGroup={false} />);
      expect(screen.queryByTestId("users-icon")).not.toBeInTheDocument();
    });
  });

  describe("mute indicator", () => {
    it("should show muted icon when contact is muted", () => {
      const mutedContact = {
        ...mockContact,
        muted: true,
      };
      render(<ChatHeader {...defaultProps} contact={mutedContact} />);
      expect(screen.getByTestId("bell-off-icon")).toBeInTheDocument();
    });

    it("should not show muted icon when contact is not muted", () => {
      const unmutedContact = {
        ...mockContact,
        muted: false,
      };
      render(<ChatHeader {...defaultProps} contact={unmutedContact} />);
      expect(screen.queryByTestId("bell-off-icon")).not.toBeInTheDocument();
    });
  });

  describe("info button", () => {
    it("should call onShowInfo when info button is clicked", () => {
      render(<ChatHeader {...defaultProps} />);

      const infoButton = screen.getByTestId("button");
      infoButton.click();

      expect(defaultProps.onShowInfo).toHaveBeenCalledTimes(1);
    });

    it("should have aria-label for accessibility", () => {
      render(<ChatHeader {...defaultProps} />);

      const infoButton = screen.getByTestId("button");
      expect(infoButton).toHaveAttribute("aria-label", "Info");
    });
  });

  describe("avatar", () => {
    it("should display avatar image", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByTestId("avatar-image")).toBeInTheDocument();
    });

    it("should display avatar fallback with first letter of name", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("J");
    });

    it("should use placeholder for empty avatar", () => {
      const contactWithoutAvatar = {
        ...mockContact,
        avatar: "",
      };
      render(<ChatHeader {...defaultProps} contact={contactWithoutAvatar} />);
      const avatarImage = screen.getByTestId("avatar-image");
      expect(avatarImage).toHaveAttribute("src", "/placeholder.svg");
    });
  });

  describe("typing indicator", () => {
    it("should pass isTyping to component (typing display is external)", () => {
      render(<ChatHeader {...defaultProps} isTyping={true} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should handle false typing state", () => {
      render(<ChatHeader {...defaultProps} isTyping={false} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  describe("callback handlers", () => {
    it("should not call onVoiceCall on render", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(defaultProps.onVoiceCall).not.toHaveBeenCalled();
    });

    it("should not call onVideoCall on render", () => {
      render(<ChatHeader {...defaultProps} />);
      expect(defaultProps.onVideoCall).not.toHaveBeenCalled();
    });
  });
});
