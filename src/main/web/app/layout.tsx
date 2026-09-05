import type { Metadata } from "next";
import "./globals.css";
import { EmotionRegistry } from "./emotion-registry";
import { I18nProvider } from "@/layout/providers/i18n-provider";
import { AnalyticsProvider } from "@/layout/providers/analytics-provider";
import { StoreProvider } from "@/layout/providers/StoreProvider";
import { Toaster } from "@/shared/ui/toaster";

export const metadata: Metadata = {
  title: "whats chat",
  description: "whats chat is a chat app",
  generator: "whats chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <StoreProvider>
            <I18nProvider>
              <AnalyticsProvider>
                {children}
                <Toaster />
              </AnalyticsProvider>
            </I18nProvider>
          </StoreProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
