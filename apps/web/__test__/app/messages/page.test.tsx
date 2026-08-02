import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import MessagesPage from "@/app/(authenticated)/messages/page";

vi.mock("@/src/presentation/features/shell/real-call-context", () => ({
  useSharedRealCall: () => ({
    startCall: vi.fn(),
  }),
}));

describe("MessagesPage", () => {
  it("should_render_messages_page_when_mounted", () => {
    expect(() => render(<MessagesPage />)).not.toThrow();
  });
});
