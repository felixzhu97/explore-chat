import { describe, it, expect } from "vitest";
import type { CallType } from "../call";

describe("CallType", () => {
  it("should accept voice and video", () => {
    const types: CallType[] = ["voice", "video"];
    expect(types).toEqual(["voice", "video"]);
  });
});
