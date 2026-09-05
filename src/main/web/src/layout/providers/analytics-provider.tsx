"use client";

import { useMemo } from "react";
import {
  AnalyticsProvider as AnalyticsProviderBase,
  HttpTransport,
} from "@whatschat/analytics";

const baseURL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "http://localhost:9001/api/v1";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const transport = useMemo(
    () =>
      new HttpTransport({
        endpoint: `${baseURL}/analytics/events`,
        getToken: () =>
          typeof window !== "undefined"
            ? window.localStorage.getItem("auth_token")
            : null,
      }),
    [],
  );
  return (
    <AnalyticsProviderBase
      transport={transport}
      defaultContext={{ platform: "web" }}
    >
      {children}
    </AnalyticsProviderBase>
  );
}
