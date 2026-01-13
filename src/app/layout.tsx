import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

import { QueryProvider, ThemeProvider } from "@/providers";
import { Toaster } from "@/shared/ui/sonner";
import { TokenLimitDialogProvider } from "@/shared/ui/token-limit-dialog";
import { ApiUrlSwitcher } from "@/shared/ui/api-url-switcher";

import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
