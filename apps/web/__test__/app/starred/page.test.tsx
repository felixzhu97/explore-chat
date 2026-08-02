import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import StarredPage from "@/app/(authenticated)/starred/page";

vi.mock("@/secondary/pages/starred-messages-page", () => ({
  StarredMessagesPage: () => <div data-testid="starred-messages-page" />,
}));

describe("StarredPage", () => {
  it("should_render_starred_page_when_mounted", () => {
    expect(() => render(<StarredPage />)).not.toThrow();
  });
});
