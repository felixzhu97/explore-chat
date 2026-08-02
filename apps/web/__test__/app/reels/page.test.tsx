import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ReelsPage from "@/app/(authenticated)/reels/page";

describe("ReelsPage", () => {
  it("should render reels page", () => {
    expect(() => render(<ReelsPage />)).not.toThrow();
  });
});
