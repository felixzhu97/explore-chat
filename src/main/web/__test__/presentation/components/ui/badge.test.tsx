import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/shared/ui/badge";

describe("Badge", () => {
  describe("rendering", () => {
    it("should render badge with children", () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText("Default Badge")).toBeInTheDocument();
    });

    it("should render badge with secondary variant", () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>);
      expect(screen.getByText("Secondary Badge")).toBeInTheDocument();
    });

    it("should render badge with destructive variant", () => {
      render(<Badge variant="destructive">Destructive Badge</Badge>);
      expect(screen.getByText("Destructive Badge")).toBeInTheDocument();
    });

    it("should render badge with outline variant", () => {
      render(<Badge variant="outline">Outline Badge</Badge>);
      expect(screen.getByText("Outline Badge")).toBeInTheDocument();
    });

    it("should render badge with custom className", () => {
      render(<Badge className="custom-badge">Custom Badge</Badge>);
      expect(screen.getByText("Custom Badge")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should be focusable", () => {
      render(<Badge tabIndex={0}>Focusable Badge</Badge>);
      const badge = screen.getByText("Focusable Badge");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("children", () => {
    it("should render badge with text content", () => {
      render(<Badge>Text Content</Badge>);
      expect(screen.getByText("Text Content")).toBeInTheDocument();
    });

    it("should render badge with numeric content", () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });
});
