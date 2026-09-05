import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import StatusPage from "@/app/(authenticated)/status/page";

describe("StatusPage", () => {
  it("should render status page", () => {
    expect(() => render(<StatusPage />)).not.toThrow();
  });
});
