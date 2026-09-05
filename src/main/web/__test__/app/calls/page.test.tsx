import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CallsPage from "@/app/(authenticated)/calls/page";

describe("CallsPage", () => {
  it("should render calls page", () => {
    expect(() => render(<CallsPage />)).not.toThrow();
  });

  it("should not throw when rendered", () => {
    expect(() => render(<CallsPage />)).not.toThrow();
  });
});
