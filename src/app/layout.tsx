import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";

import { QueryProvider, ThemeProvider } from "@/providers";
import { Toaster } from "@/shared/ui/sonner";
import { TokenLimitDialogProvider } from "@/shared/ui/token-limit-dialog";
import { ConfirmDialogProvider } from "@/shared/ui/confirm-dialog";
import { ApiUrlSwitcher } from "@/shared/ui/api-url-switcher";

import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Avatar Platform - Админ-панель",
  description: "Управление AI-консультантами и аватарами",
  robots: "noindex, nofollow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <ConfirmDialogProvider>
              <TokenLimitDialogProvider>
                {children}
              </TokenLimitDialogProvider>
            </ConfirmDialogProvider>
            <Toaster />
            {/* Переключатель API — только вне production (security: нельзя дать
                пользователю увести кабинет на dev-API) */}
            {process.env.NODE_ENV !== "production" && <ApiUrlSwitcher />}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
