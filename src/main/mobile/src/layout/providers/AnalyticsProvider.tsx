import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  AnalyticsProvider as AnalyticsProviderBase,
  HttpTransport,
} from "@chat/analytics";
import { API_V1 } from "@/core/config/api";
import type { RootState } from "@/core/store";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  const transport = useMemo(
    () =>
      new HttpTransport({
        endpoint: `${API_V1}/analytics/events`,
        getToken: () => token,
      }),
    [token],
  );
  return (
    <AnalyticsProviderBase
      transport={transport}
      defaultContext={{ platform: "mobile" }}
    >
      {children}
    </AnalyticsProviderBase>
  );
}
