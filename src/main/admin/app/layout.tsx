import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { EmotionRegistry } from "./emotion-registry";
import { Providers } from "./providers";
import { ThemeInitScript } from "./theme-init";

export const metadata: Metadata = {
  title: "WhatsChat Admin",
  description: "WhatsChat admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeInitScript />
        <EmotionRegistry>
          <Providers>{children}</Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}
