"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  ArrowRight,
  Bot,
  FileText,
  LogOut,
  Moon,
  Send,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

import { useAuthStore, useMe } from "@/entities/auth";
import { useUsageSummary } from "@/entities/billing";
import { authApi } from "@/entities/auth";
import { tokenManager } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PlanBadge } from "@/shared/ui/plan-badge";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout: logoutStore } = useAuthStore();
  const { isLoading: userLoading } = useMe();
  const { data: usageSummary, isLoading: usageLoading } = useUsageSummary();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !tokenManager.hasToken()) {
      router.replace("/login");
    }
  }, [router]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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

  const features = [
    {
      icon: Bot,
      title: "AI-аватары",
      description: "Создавайте консультантов с уникальными промптами и настройками LLM",
    },
    {
      icon: FileText,
      title: "База знаний",
      description: "Загружайте PDF, DOCX, TXT — аватар отвечает на их основе",
    },
    {
      icon: Send,
      title: "Telegram",
      description: "Подключите бота и общайтесь с аватаром в мессенджере",
    },
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
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-primary text-accent-contrast font-bold">
              A
            </div>
            <span className="font-semibold text-lg text-text-primary">Avatar AI</span>
          </div>

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
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

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
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Plan Badge */}
            {isLoading ? (
              <Skeleton className="h-6 w-20 mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-text-muted">Ваш тариф:</span>
                <PlanBadge plan={currentPlan} size="md" />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight">
              AI Avatar Platform
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-text-secondary max-w-xl mx-auto">
              Создавайте умных AI-консультантов на основе ваших документов. 
              Интегрируйте в Telegram за минуты.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {shouldShowUpgrade ? (
                <Button size="lg" asChild>
                  <Link href="/settings/usage">
                    Повысить тариф
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/projects">
                    Перейти к проектам
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link href="/projects">
                  Мои проекты
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Возможности платформы</h2>
            <p className="text-text-secondary">
              Всё необходимое для создания AI-консультантов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <div className="size-12 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-4">
                      <Icon className="size-6 text-accent-primary" />
                    </div>
                    <CardTitle className="text-lg text-text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-text-secondary">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} AI Avatar Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
