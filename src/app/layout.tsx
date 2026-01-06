import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { QueryProvider, ThemeProvider } from "@/providers";
import { Toaster } from "@/shared/ui/sonner";
import { TokenLimitDialogProvider } from "@/shared/ui/token-limit-dialog";
import { ApiUrlSwitcher } from "@/shared/ui/api-url-switcher";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UI Kit 2026 | AI Avatar Platform",
  description: "Modern Design System for AI-powered applications - Neo-Minimal with Depth",
  keywords: ["design system", "ui kit", "ai avatar", "tailwind", "react"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <TokenLimitDialogProvider>
              {children}
            </TokenLimitDialogProvider>
            <Toaster />
            <ApiUrlSwitcher />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
