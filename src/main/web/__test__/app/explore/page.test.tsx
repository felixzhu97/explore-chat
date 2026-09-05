import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ExplorePage from "@/app/(authenticated)/explore/page";

describe("ExplorePage", () => {
  it("should render explore page", () => {
    render(<ExplorePage />);
    // The page renders feature container within authenticated layout
    // In a real scenario, this would have explore content
  });

  it("should not throw when rendered", () => {
    expect(() => render(<ExplorePage />)).not.toThrow();
  });
});
