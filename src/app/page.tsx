"use client";

import Link from "next/link";
import { Logo } from "@/shared/ui/logo";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { motion, useReducedMotion } from "motion/react";

import {
  ArrowRight,
  Bot,
  FileText,
  LogOut,
  Send,
  Settings,
  User,
} from "lucide-react";

import { useAuthStore, useMe, authApi } from "@/entities/auth";
import { useUsageSummary } from "@/entities/billing";
import { tokenManager } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { NumberTicker } from "@/shared/ui/number-ticker";
import { PlanBadge } from "@/shared/ui/plan-badge";
import { ShimmerButton } from "@/shared/ui/shimmer-button";
import { Skeleton } from "@/shared/ui/skeleton";
import { TextScramble } from "@/shared/ui/text-scramble";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/shared/ui/terminal";

// Тяжёлый анимированный фон — только на клиенте.
const AnimatedGridPattern = dynamic(
  () => import("@/shared/ui/animated-grid-pattern").then((m) => m.AnimatedGridPattern),
  { ssr: false },
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export default function HomePage() {
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();
  const { isLoading: userLoading } = useMe();
  const { data: usageSummary, isLoading: usageLoading } = useUsageSummary();
  const prefersReducedMotion = useReducedMotion();

  // Каскадный entrance hero — отключается при reduced-motion (финал сразу).
  const fadeUp = (i: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !tokenManager.hasToken()) {
      router.replace("/login");
    }
  }, [router]);


  const handleLogout = async () => {
    try {
      await authApi.logout();
      logoutStore();
      router.push("/login");
    } catch {
      // Still logout locally
      logoutStore();
      router.push("/login");
    }
  };

  const isLoading = userLoading || usageLoading;
  const currentPlan = usageSummary?.plan ?? "free";
  const shouldShowUpgrade = currentPlan === "free" || currentPlan === "starter";

  // Компактная полоса фич под терминалом (иконка + короткий факт, без карточек).
  const features = [
    { icon: FileText, label: "RAG по вашим PDF, DOCX, TXT" },
    { icon: Send, label: "Один бот в Telegram + чат-виджет" },
    { icon: Bot, label: "Лимиты токенов и тарифы из коробки" },
  ];

  // Show loading while checking auth
  if (!tokenManager.hasToken() && typeof window !== "undefined") {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Logo size="md" withText />

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/projects"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Проекты
            </Link>
            <Link
              href="/settings/profile"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Настройки
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User Menu */}
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="size-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user?.full_name || user?.email?.split("@")[0] || "Пользователь"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user?.full_name || "Пользователь"}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings/profile" className="cursor-pointer">
                      <Settings className="size-4 mr-2" />
                      Настройки
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-error cursor-pointer">
                    <LogOut className="size-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background: лёгкий tint + анимированная техно-сетка */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-burgundy/5" />
        <AnimatedGridPattern
          numSquares={24}
          maxOpacity={0.08}
          duration={4}
          className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-60"
        />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Plan Badge */}
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <motion.div className="flex items-center justify-center gap-2" {...fadeUp(0)}>
                <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                  Ваш тариф:
                </span>
                <PlanBadge plan={currentPlan} size="md" />
              </motion.div>
            )}

            {/* Title — ключевая часть с decrypt-эффектом */}
            <motion.h1
              className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight font-mono"
              {...fadeUp(1)}
            >
              <TextScramble duration={1} speed={0.03}>
                Аватар читает ваши документы
              </TextScramble>{" "}
              и отвечает клиентам в <span className="text-gradient">Telegram</span>
            </motion.h1>

            {/* Subtitle — конкретика продукта */}
            <motion.p className="text-lg text-text-secondary max-w-xl mx-auto" {...fadeUp(2)}>
              Загрузите PDF — получите AI-консультанта, который отвечает по вашей базе
              знаний через RAG. Telegram-бот и чат-виджет, лимиты токенов и тарифы — без
              кода.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              {...fadeUp(3)}
            >
              <Link href={shouldShowUpgrade ? "/settings/usage" : "/projects"}>
                <ShimmerButton className="px-7 py-3 text-base">
                  {shouldShowUpgrade ? "Повысить тариф" : "Перейти к проектам"}
                  <ArrowRight className="size-4" />
                </ShimmerButton>
              </Link>
              <Button variant="outline" size="lg" asChild>
                <Link href="/projects">
                  Мои проекты
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section — терминал с живой сессией продукта вместо рассказа о нём */}
      <section className="py-16 bg-bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-mono">
              PDF → готовый консультант
            </h2>
            <p className="text-text-secondary">
              От документа до бота в Telegram — две команды
            </p>
          </div>

          {/* Terminal-окно с демо-сессией */}
          <Terminal title="avatar — demo session" className="mx-auto">
            <TypingAnimation delay={300} className="text-text-secondary">
              $ avatar create --from docs/price-list.pdf
            </TypingAnimation>
            <AnimatedSpan delay={1600} className="text-accent-primary">
              ✓ 142 chunks indexed · 1.2 MB
            </AnimatedSpan>

            <TypingAnimation delay={2200} className="text-text-secondary">
              $ avatar deploy --telegram @my_shop_bot
            </TypingAnimation>
            <AnimatedSpan delay={3600} className="text-accent-primary">
              ✓ live · webhook ok
            </AnimatedSpan>

            <AnimatedSpan delay={4400} className="pt-2 text-text-muted">
              # @my_shop_bot
            </AnimatedSpan>
            <AnimatedSpan delay={4800}>
              <span className="text-burgundy">client&gt;</span>{" "}
              <span className="text-text-primary">Сколько стоит доставка?</span>
            </AnimatedSpan>
            <AnimatedSpan delay={5400}>
              <span className="text-accent-primary">avatar&gt;</span>{" "}
              <span className="text-text-secondary">
                Доставка по Москве — 300 ₽, бесплатно от 5000 ₽.
              </span>
            </AnimatedSpan>
          </Terminal>

          {/* Компактная полоса фич — одной строкой, без карточек */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <Icon className="size-4 shrink-0 text-accent-primary" aria-hidden />
                  <span>{feature.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section — счётчики с NumberTicker */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-text-primary">
                <NumberTicker value={142} />
                <span className="text-accent-primary"> chunks</span>
              </div>
              <p className="text-sm text-text-muted">проиндексировано из одного PDF</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-text-primary">
                &lt;<NumberTicker value={2} />
                <span className="text-accent-primary"> сек</span>
              </div>
              <p className="text-sm text-text-muted">средний ответ аватара</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-text-primary">
                <NumberTicker value={2} />
                <span className="text-accent-primary"> канала</span>
              </div>
              <p className="text-sm text-text-muted">Telegram-бот и чат-виджет</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary font-mono">
              Загрузите первый документ
            </h2>
            <p className="text-text-secondary">
              Создайте проект, добавьте PDF и подключите бота — аватар начнёт отвечать
              по вашей базе знаний.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={shouldShowUpgrade ? "/settings/usage" : "/projects"}>
                <ShimmerButton className="px-7 py-3 text-base">
                  {shouldShowUpgrade ? "Повысить тариф" : "Создать аватар"}
                  <ArrowRight className="size-4" />
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-text-muted">
            ©{" "}
            <span className="font-mono tabular-nums">
              {new Date().getFullYear()}
            </span>{" "}
            Avatar AI
          </p>
        </div>
      </footer>
    </div>
  );
}
