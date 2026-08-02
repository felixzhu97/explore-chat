"use client";

import { createContext, useContext } from "react";
import { useRealCall } from "@/src/presentation/hooks/use-real-call";

type RealCallContextValue = ReturnType<typeof useRealCall>;

const RealCallContext = createContext<RealCallContextValue | null>(null);

export function RealCallProvider({ children }: { children: React.ReactNode }) {
  const value = useRealCall();
  return (
    <RealCallContext.Provider value={value}>
      {children}
    </RealCallContext.Provider>
  );
}

export function useSharedRealCall(): RealCallContextValue {
  const ctx = useContext(RealCallContext);
  if (!ctx) {
    throw new Error("useSharedRealCall must be used within RealCallProvider");
  }
  return ctx;
}
