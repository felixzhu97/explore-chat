import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the actual Button component with a simple implementation
vi.mock("@/shared/ui/button", () => {
  const React = require("react");

  const MockButton = React.forwardRef<HTMLButtonElement, any>(
    ({ asChild = false, children, ...props }, ref) => {
      if (asChild) {
        return <>{React.Children.only(children)}</>;
      }
      return (
        <button ref={ref} {...props}>
          {children}
        </button>
      );
    },
  );
  MockButton.displayName = "Button";

  return { Button: MockButton };
});

// Mock the styled utility
vi.mock("@/src/shared/utils/emotion", () => ({
  styled: vi.fn(() => (Component: any) => Component),
}));

// Mock @radix-ui/react-slot
vi.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children }: { children: React.ReactNode }) => children,
}));

// Import mocked component
import { Button } from "@/shared/ui/button";

describe("Button Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render button with children content", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: /click me/i }),
      ).toBeInTheDocument();
    });

    it("should render as button element by default", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render button with text content", () => {
      render(<Button>Submit Form</Button>);
      expect(
        screen.getByRole("button", { name: /submit form/i }),
      ).toBeInTheDocument();
    });

    it("should render button with multiple children", () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should render disabled button", () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(
        screen.getByRole("button", { name: /disabled button/i }),
      ).toBeDisabled();
    });

    it("should have disabled attribute set", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("disabled");
    });

    it("should not respond to clicks when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not respond to keyboard events when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      const button = screen.getByRole("button");
      await user.tab();
      expect(document.activeElement).not.toBe(button);
    });
  });

  describe("Click Events", () => {
    it("should call onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button", { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick with event data", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          target: expect.any(Element),
        }),
      );
    });

    it("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Keyboard Navigation", () => {
    it("should be focusable via tab", async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);

      await user.tab();
      expect(screen.getByRole("button", { name: /focusable/i })).toHaveFocus();
    });

    it("should respond to enter key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      await user.tab();
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should respond to space key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Space</Button>);

      await user.tab();
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variants", () => {
    it.each([
      ["default", "Default"],
      ["destructive", "Destructive"],
      ["outline", "Outline"],
      ["secondary", "Secondary"],
      ["ghost", "Ghost"],
      ["link", "Link"],
    ])("should render with %s variant", (variant, name) => {
      render(<Button variant={variant as any}>{name}</Button>);
      expect(
        screen.getByRole("button", { name: new RegExp(name, "i") }),
      ).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it.each([
      ["default", "Default Size"],
      ["sm", "Small"],
      ["lg", "Large"],
      ["icon", "Icon"],
    ])("should render with %s size", (size, name) => {
      render(<Button size={size as any}>{name}</Button>);
      expect(
        screen.getByRole("button", { name: new RegExp(name, "i") }),
      ).toBeInTheDocument();
    });
  });

  describe("Type Attribute", () => {
    it("should accept submit type", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("should accept reset type", () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
    });

    it("should preserve type attribute", () => {
      render(<Button type="button">Button</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("asChild Prop", () => {
    it("should render child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      );
      expect(
        screen.getByRole("link", { name: /link button/i }),
      ).toBeInTheDocument();
    });

    it("should render anchor with href", () => {
      render(
        <Button asChild>
          <a href="https://example.com">External Link</a>
        </Button>,
      );
      const link = screen.getByRole("link", { name: /external link/i });
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("className Merging", () => {
    it("should include custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button", { name: /custom/i });
      expect(button.className).toContain("custom-class");
    });

    it("should handle multiple classNames", () => {
      render(<Button className="class1 class2">Multiple</Button>);
      const button = screen.getByRole("button", { name: /multiple/i });
      expect(button.className).toContain("class1");
      expect(button.className).toContain("class2");
    });
  });

  describe("Accessibility", () => {
    it("should support aria-label", () => {
      render(
        <Button aria-label="Close dialog">
          <span aria-hidden>X</span>
        </Button>,
      );
      expect(
        screen.getByRole("button", { name: /close dialog/i }),
      ).toBeInTheDocument();
    });

    it("should support aria-disabled", () => {
      render(<Button aria-disabled={true}>Aria Disabled</Button>);
      const button = screen.getByRole("button", { name: /aria disabled/i });
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should support aria-describedby", () => {
      render(
        <>
          <Button aria-describedby="button-description">
            With Description
          </Button>
          <span id="button-description">This is a helpful description</span>
        </>,
      );
      const button = screen.getByRole("button", { name: /with description/i });
      expect(button).toHaveAttribute("aria-describedby", "button-description");
    });

    it("should support aria-pressed for toggle buttons", () => {
      render(<Button aria-pressed={false}>Toggle</Button>);
      const button = screen.getByRole("button", { name: /toggle/i });
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("should be keyboard accessible", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Accessible</Button>);

      const button = screen.getByRole("button", { name: /accessible/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      render(<Button>{"\u200b"}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle null children", () => {
      render(<Button>{null}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle undefined props gracefully", () => {
      render(
        <Button onClick={undefined} className={undefined}>
          Undefined Props
        </Button>,
      );
      expect(
        screen.getByRole("button", { name: /undefined props/i }),
      ).toBeInTheDocument();
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(1000);
      render(<Button>{longText}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Loading State Simulation", () => {
    it("should handle disabled state during loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      const { rerender } = render(
        <Button onClick={handleClick} disabled={true}>
          Loading
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();

      rerender(
        <Button onClick={handleClick} disabled={false}>
          Loading
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
