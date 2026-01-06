"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  FolderKanban,
  HelpCircle,
  Key,
  LayoutDashboard,
  MessageSquare,
  Send,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { TokenCounter } from "@/shared/ui/token-counter";
import { useAuthStore, isAdmin } from "@/entities/auth";
import { useUsageSummary } from "@/entities/billing";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
  adminOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, onCollapsedChange, logo, footer, ...props }, ref) => {
    const pathname = usePathname();
    const params = useParams();
    const { user } = useAuthStore();
    const { data: usageSummary } = useUsageSummary();

    const projectId = params?.id as string | undefined;
    const avatarId = params?.avatarId as string | undefined;

    // Build navigation sections dynamically based on context
    const navSections = React.useMemo(() => {
      const sections: NavSection[] = [];

      // Main navigation
      const mainItems: NavItem[] = [
        { title: "Проекты", href: "/projects", icon: FolderKanban },
      ];
      sections.push({ items: mainItems });

      // Project-specific navigation (if in project context)
      if (projectId) {
        const projectItems: NavItem[] = [
          { title: "Обзор", href: `/projects/${projectId}`, icon: LayoutDashboard },
          { title: "Аватары", href: `/projects/${projectId}/avatars`, icon: Bot },
          { title: "Участники", href: `/projects/${projectId}/members`, icon: Users },
          { title: "Аналитика", href: `/projects/${projectId}/analytics`, icon: BarChart3 },
          {
            title: "Telegram",
            href: `/projects/${projectId}/integrations/telegram`,
            icon: Send,
          },
          { title: "Секреты", href: `/projects/${projectId}/settings/secrets`, icon: Key },
          { title: "Настройки", href: `/projects/${projectId}/settings`, icon: Settings },
        ];
        sections.push({ title: "Проект", items: projectItems });
      }

      // Avatar-specific navigation (if in avatar context)
      if (projectId && avatarId) {
        const avatarItems: NavItem[] = [
          {
            title: "Настройки аватара",
            href: `/projects/${projectId}/avatars/${avatarId}`,
            icon: Bot,
          },
          {
            title: "Документы",
            href: `/projects/${projectId}/avatars/${avatarId}/documents`,
            icon: FileText,
          },
          {
            title: "Тестовый чат",
            href: `/projects/${projectId}/avatars/${avatarId}/chat`,
            icon: MessageSquare,
          },
          {
            title: "История сессий",
            href: `/projects/${projectId}/avatars/${avatarId}/sessions`,
            icon: FileText,
          },
        ];
        sections.push({ title: "Аватар", items: avatarItems });
      }

      // Admin section (only for saas_admin)
      if (isAdmin(user)) {
        const adminItems: NavItem[] = [
          { title: "Пользователи", href: "/admin/users", icon: Users, adminOnly: true },
          {
            title: "Аналитика платформы",
            href: "/admin/analytics",
            icon: BarChart3,
            adminOnly: true,
          },
          { title: "Биллинг", href: "/admin/billing", icon: CreditCard, adminOnly: true },
          {
            title: "Настройки платформы",
            href: "/admin/settings/platform",
            icon: Key,
            adminOnly: true,
          },
          { title: "Аудит логи", href: "/admin/audit", icon: Shield, adminOnly: true },
        ];
        sections.push({ title: "Администрирование", items: adminItems });
      }

      return sections;
    }, [projectId, avatarId, user]);

    return (
      <TooltipProvider delayDuration={0}>
        <aside
          ref={ref}
          data-collapsed={collapsed}
          className={cn(
            "group/sidebar relative flex h-screen flex-col border-r border-border bg-bg-secondary transition-all duration-300",
            collapsed ? "w-[68px]" : "w-[260px]",
            className
          )}
          {...props}
        >
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-4">
            {logo || (
              <Link href="/projects" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-accent-primary text-accent-contrast font-semibold">
                  A
                </div>
                {!collapsed && (
                  <span className="font-semibold text-lg text-text-primary">Avatar AI</span>
                )}
              </Link>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-6 px-3">
              {navSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-1">
                  {section.title && !collapsed && (
                    <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {section.title}
                    </h4>
                  )}
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/projects" && pathname?.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    const linkContent = (
                      <Link
                        href={item.disabled ? "#" : item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isActive
                            ? "bg-accent-primary/10 text-accent-primary"
                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                          item.disabled && "pointer-events-none opacity-50",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className={cn("size-5 shrink-0", isActive && "text-accent-primary")} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-semibold text-accent-contrast">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-semibold text-accent-contrast">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="mt-auto border-t border-border p-3 space-y-1">
            {footer || (
              <>
                {/* Token Counter */}
                {usageSummary && (
                  <TokenCounter
                    chatUsed={usageSummary.chat_tokens_used}
                    chatLimit={usageSummary.chat_tokens_limit}
                    showDetails={!collapsed}
                    compact={collapsed}
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings/profile"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Settings className="size-5" />
                      {!collapsed && <span>Настройки профиля</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">Настройки профиля</TooltipContent>}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="#"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <HelpCircle className="size-5" />
                      {!collapsed && <span>Помощь</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">Помощь</TooltipContent>}
                </Tooltip>
              </>
            )}
          </div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-20 z-10 size-6 rounded-full border border-border bg-bg-secondary shadow-sm"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span className="sr-only">{collapsed ? "Развернуть" : "Свернуть"}</span>
          </Button>
        </aside>
      </TooltipProvider>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
