"use client";

import { useEffect, type ReactNode } from "react";
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[image:var(--gradient-primary)] mb-4 shadow-sm">
            <svg
              className="w-8 h-8 text-[var(--primary-foreground)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">AI Avatar Platform</h1>
          <p className="text-text-secondary mt-1">
            Платформа для создания AI-консультантов
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} AI Avatar Platform. Все права защищены.
        </p>
      </div>
    </div>
  );
}
