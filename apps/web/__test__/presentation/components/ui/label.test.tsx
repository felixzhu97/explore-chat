import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/shared/ui/label";

describe("Label", () => {
  describe("rendering", () => {
    it("should render label with text", () => {
      render(<Label>Email Address</Label>);
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("should render label with htmlFor", () => {
      render(<Label htmlFor="email">Email</Label>);
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email");
    });

    it("should render label with custom className", () => {
      render(<Label className="custom-label">Custom Label</Label>);
      expect(screen.getByText("Custom Label")).toBeInTheDocument();
    });
  });

  describe("association with input", () => {
    it("should be associated with input via htmlFor", () => {
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" data-testid="input" />
        </>,
      );

      const input = screen.getByTestId("input");
      const label = screen.getByText("Username");
      expect(label).toHaveAttribute("for", "username");
      expect(input).toHaveAttribute("id", "username");
    });
  });

  describe("accessibility", () => {
    it("should have proper label role", () => {
      render(<Label>Accessible Label</Label>);
      expect(screen.getByText("Accessible Label")).toBeInTheDocument();
    });
  });
});
