import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert";

describe("Alert", () => {
  describe("rendering", () => {
    it("should render alert with default variant", () => {
      render(<Alert>Default alert content</Alert>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Default alert content")).toBeInTheDocument();
    });

    it("should render alert with destructive variant", () => {
      render(<Alert variant="destructive">Destructive alert</Alert>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Destructive alert")).toBeInTheDocument();
    });

    it("should render alert with custom className", () => {
      render(<Alert className="custom-class">Alert with className</Alert>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should forward ref to the underlying element", () => {
      const ref = { current: null };
      render(<Alert ref={ref as any}>Alert with ref</Alert>);
      expect(ref.current).not.toBeNull();
    });
  });

  describe("AlertTitle", () => {
    it("should render alert title", () => {
      render(<AlertTitle>Alert Title</AlertTitle>);
      expect(screen.getByText("Alert Title")).toBeInTheDocument();
    });
  });

  describe("AlertDescription", () => {
    it("should render alert description", () => {
      render(<AlertDescription>Alert description text</AlertDescription>);
      expect(screen.getByText("Alert description text")).toBeInTheDocument();
    });

    it("should render nested paragraph in description", () => {
      render(
        <AlertDescription>
          <p>Nested paragraph content</p>
        </AlertDescription>,
      );
      expect(screen.getByText("Nested paragraph content")).toBeInTheDocument();
    });
  });

  describe("combined usage", () => {
    it("should render complete alert structure", () => {
      render(
        <Alert>
          <AlertTitle>Error occurred</AlertTitle>
          <AlertDescription>
            <p>There was an error processing your request.</p>
          </AlertDescription>
        </Alert>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Error occurred")).toBeInTheDocument();
      expect(
        screen.getByText("There was an error processing your request."),
      ).toBeInTheDocument();
    });
  });
});
