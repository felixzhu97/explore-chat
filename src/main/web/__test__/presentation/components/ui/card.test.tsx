import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";

describe("Card", () => {
  describe("Card component", () => {
    it("should render card", () => {
      render(<Card data-testid="card" />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should render card with custom className", () => {
      render(<Card className="custom-card" data-testid="card" />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should render card with children", () => {
      render(
        <Card data-testid="card">
          <p>Card content</p>
        </Card>,
      );
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });
  });

  describe("CardHeader component", () => {
    it("should render card header", () => {
      render(<CardHeader data-testid="card-header" />);
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
    });

    it("should render card header with content", () => {
      render(
        <CardHeader data-testid="card-header">
          <h2>Header Content</h2>
        </CardHeader>,
      );
      expect(screen.getByText("Header Content")).toBeInTheDocument();
    });
  });

  describe("CardTitle component", () => {
    it("should render card title", () => {
      render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
    });
  });

  describe("CardDescription component", () => {
    it("should render card description", () => {
      render(
        <CardDescription data-testid="card-desc">
          Card description text
        </CardDescription>,
      );
      expect(screen.getByTestId("card-desc")).toBeInTheDocument();
      expect(screen.getByText("Card description text")).toBeInTheDocument();
    });
  });

  describe("CardContent component", () => {
    it("should render card content", () => {
      render(
        <CardContent data-testid="card-content">
          <p>Main content</p>
        </CardContent>,
      );
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
      expect(screen.getByText("Main content")).toBeInTheDocument();
    });
  });

  describe("CardFooter component", () => {
    it("should render card footer", () => {
      render(
        <CardFooter data-testid="card-footer">
          <button>Action</button>
        </CardFooter>,
      );
      expect(screen.getByTestId("card-footer")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action" }),
      ).toBeInTheDocument();
    });
  });

  describe("combined usage", () => {
    it("should render complete card structure", () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Welcome Card</CardTitle>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Accept</button>
            <button>Decline</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("Welcome Card")).toBeInTheDocument();
      expect(screen.getByText("This is a description")).toBeInTheDocument();
      expect(
        screen.getByText("Main card content goes here"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Accept" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Decline" }),
      ).toBeInTheDocument();
    });
  });
});
