"use client";

import { useEffect } from "react";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";

const apiHost = process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST;
const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;

const gb = new GrowthBook({
  apiHost: apiHost ?? undefined,
  clientKey: clientKey ?? undefined,
  enableDevMode: process.env.NODE_ENV === "development",
  attributes: {
    environment: process.env.NODE_ENV,
  },
  trackingCallback: (experiment, result) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Viewed Experiment", {
        experimentId: experiment.key,
        variationId: result.key,
      });
    }
    if (typeof window === "undefined") return;
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (w.gtag) {
      w.gtag("event", "experiment_viewed", {
        experiment_id: experiment.key,
        variation_id: String(result.key),
      });
    }
  },
});

export function GrowthBookProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (apiHost && clientKey) {
      gb.init({ timeout: 2000 });
    } else {
      // Inline experiments only: no remote config, mark as ready with empty payload
      gb.init({ payload: { features: {} } });
    }
    // Ensure attributes are set after init (e.g. for environment-based rules)
    gb.setAttributes({
      ...gb.getAttributes(),
      environment: process.env.NODE_ENV,
    });
    return () => gb.destroy();
  }, []);

  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}
