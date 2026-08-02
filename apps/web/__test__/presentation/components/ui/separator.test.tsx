import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "@/shared/ui/separator";

describe("Separator", () => {
  describe("rendering", () => {
    it("should render separator", () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });

    it("should render with default horizontal orientation", () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });

    it("should render with vertical orientation", () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });

  describe("decorative prop", () => {
    it("should render decorative separator by default", () => {
      render(<Separator decorative data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });

    it("should render non-decorative separator", () => {
      render(<Separator decorative={false} data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should render separator element", () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });
});
