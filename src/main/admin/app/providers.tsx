"use client";

import "@/src/shared/i18n";
import { ThemeProvider } from "@/src/presentation/providers/theme-provider";
import { AuthProvider } from "@/src/presentation/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
