"use client";

import { useExperiment } from "@growthbook/growthbook-react";

/**
 * Simple A/B test hook. Returns "control" or "variant" (or custom variation names).
 * Uses GrowthBook's useExperiment under the hood; works with inline experiments (no backend required).
 *
 * @example
 * const variant = useAbTest("message-input-style");
 * return variant === "variant" ? <NewInput /> : <OldInput />;
 */
export function useAbTest(
  experimentKey: string,
  options?: {
    /** Variation names; default ["control", "variant"] */
    variations?: [string, string];
  },
): "control" | "variant" | string {
  const variations = options?.variations ?? ["control", "variant"];
  const { value } = useExperiment({
    key: experimentKey,
    variations,
  });
  return value ?? variations[0];
}
