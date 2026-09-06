import { createContext, useContext, useMemo } from "react";
import type { EventContext } from "./client";
import type { KnownEventName, KnownEventPayloadMap } from "./events";
import { createAnalytics } from "./client";
import type { IAnalyticsTransport } from "./transport";

interface AnalyticsContextValue {
  track(name: KnownEventName, payload?: KnownEventPayloadMap[KnownEventName]): void;
  track(name: string, properties?: Record<string, unknown>): void;
  identify(userId: string): void;
  setContext(ctx: Partial<EventContext>): void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export interface AnalyticsProviderProps {
  transport: IAnalyticsTransport;
  defaultContext?: EventContext;
  children: React.ReactNode;
}

export function AnalyticsProvider({
  transport,
  defaultContext,
  children,
}: AnalyticsProviderProps): React.ReactElement {
  const value = useMemo(() => {
    const client = createAnalytics({ transport, defaultContext });
    return {
      track: client.track.bind(client),
      identify: client.identify.bind(client),
      setContext: client.setContext.bind(client),
    };
  }, [transport, defaultContext]);

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    return {
      track: () => {},
      identify: () => {},
      setContext: () => {},
    };
  }
  return ctx;
}
