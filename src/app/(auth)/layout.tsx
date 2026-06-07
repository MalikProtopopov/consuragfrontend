"use client";

import { useEffect, type ReactNode } from "react";
import { Logo, BRAND_NAME } from "@/shared/ui/logo";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/shared/api";

// Анимированная техно-сетка — только на клиенте (тяжёлый фон).
const AnimatedGridPattern = dynamic(
  () => import("@/shared/ui/animated-grid-pattern").then((m) => m.AnimatedGridPattern),
  { ssr: false },
);

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  // Redirect to projects if already logged in
  useEffect(() => {
    if (tokenManager.hasToken()) {
      router.replace("/projects");
    }
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-primary px-4">
      {/* Techno background: subtle primary tint + animated grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-burgundy/5"
      />
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.1}
        duration={4}
        className="pointer-events-none opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{BRAND_NAME}</h1>
          <p className="text-text-secondary mt-1">
            AI-консультанты по вашим документам — в Telegram и на сайте
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} Avatar AI. Все права защищены.
        </p>
      </div>
    </div>
  );
}
