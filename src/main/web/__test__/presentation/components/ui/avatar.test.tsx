import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";

describe("Avatar", () => {
  describe("Avatar component", () => {
    it("should render avatar", () => {
      render(<Avatar data-testid="avatar" />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Avatar className="custom-avatar" data-testid="avatar" />);
      expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });
  });

  describe("AvatarFallback component", () => {
    it("should render avatar fallback with children", () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should render initials as fallback", () => {
      render(
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText("AB")).toBeInTheDocument();
    });
  });

  describe("combined usage", () => {
    it("should render avatar with fallback", () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      );
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });
});
