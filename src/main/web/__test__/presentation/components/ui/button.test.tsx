import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/shared/ui/button";

describe("Button", () => {
  describe("rendering", () => {
    it("should render button with children", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument();
    });

    it("should render button with default variant", () => {
      render(<Button>Default Button</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render button with destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    });

    it("should render button with outline variant", () => {
      render(<Button variant="outline">Outline Button</Button>);
      expect(
        screen.getByRole("button", { name: "Outline Button" }),
      ).toBeInTheDocument();
    });

    it("should render button with secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(
        screen.getByRole("button", { name: "Secondary" }),
      ).toBeInTheDocument();
    });

    it("should render button with ghost variant", () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      expect(
        screen.getByRole("button", { name: "Ghost Button" }),
      ).toBeInTheDocument();
    });

    it("should render button with link variant", () => {
      render(<Button variant="link">Link Button</Button>);
      expect(
        screen.getByRole("button", { name: "Link Button" }),
      ).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it("should render button with default size", () => {
      render(<Button size="default">Default Size</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render button with sm size", () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole("button", { name: "Small" })).toBeInTheDocument();
    });

    it("should render button with lg size", () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole("button", { name: "Large" })).toBeInTheDocument();
    });

    it("should render button with icon size", () => {
      render(<Button size="icon">🔔</Button>);
      expect(screen.getByRole("button", { name: "🔔" })).toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("should render disabled button", () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole("button", { name: "Disabled Button" });
      expect(button).toBeDisabled();
    });

    it("should render loading button", () => {
      render(<Button disabled>Loading...</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled Click
        </Button>,
      );

      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("forwarding ref", () => {
    it("should forward ref to button element", () => {
      const ref = { current: null };
      render(<Button ref={ref as any}>With Ref</Button>);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("attributes", () => {
    it("should pass through custom className", () => {
      render(<Button className="custom-class">Custom Class</Button>);
      expect(
        screen.getByRole("button", { name: "Custom Class" }),
      ).toBeInTheDocument();
    });

    it("should pass through type attribute", () => {
      render(<Button type="submit">Submit Button</Button>);
      expect(
        screen.getByRole("button", { name: "Submit Button" }),
      ).toHaveAttribute("type", "submit");
    });

    it("should render with type button when not specified", () => {
      render(<Button>Default Type</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });
});
