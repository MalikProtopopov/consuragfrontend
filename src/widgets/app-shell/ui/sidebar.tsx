"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Folder,
  FolderKanban,
  HelpCircle,
  Key,
  LayoutDashboard,
  MessageSquare,
  Send,
  Settings,
  Shield,
  Sliders,
  UserCircle,
  Users,
  UsersRound,
} from "lucide-react";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { TokenCounter } from "@/shared/ui/token-counter";
import { useAuthStore, isAdmin } from "@/entities/auth";
import { useUsageSummary } from "@/entities/billing";
import { useProjects } from "@/entities/project";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
  adminOnly?: boolean;
  children?: NavItem[];
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

const MAX_PROJECTS_IN_SIDEBAR = 5;

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, onCollapsedChange, logo, footer, ...props }, ref) => {
    const pathname = usePathname();
    const params = useParams();
    const { user } = useAuthStore();
    const { data: usageSummary } = useUsageSummary();
    const { data: projectsData } = useProjects();
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

    const projectId = params?.id as string | undefined;
    const avatarId = params?.avatarId as string | undefined;

    // Get limited projects for sidebar
    const sidebarProjects = React.useMemo(() => {
      return projectsData?.items?.slice(0, MAX_PROJECTS_IN_SIDEBAR) || [];
    }, [projectsData]);

    // Get current project name
    const currentProjectName = React.useMemo(() => {
      if (!projectId || !projectsData?.items) return null;
      const project = projectsData.items.find((p) => p.id === projectId);
      return project?.name || null;
    }, [projectId, projectsData]);

    // Auto-expand items based on current path
    React.useEffect(() => {
      if (projectId) {
        const membersPath = `/projects/${projectId}/members`;
        const usersPath = `/projects/${projectId}/users`;
        const settingsPath = `/projects/${projectId}/settings`;

        if (pathname?.startsWith(membersPath) || pathname?.startsWith(usersPath)) {
          setExpandedItems((prev) =>
            prev.includes("участники") ? prev : [...prev, "участники"]
          );
        }
        if (pathname?.startsWith(settingsPath)) {
          setExpandedItems((prev) =>
            prev.includes("настройки") ? prev : [...prev, "настройки"]
          );
        }
      }
      // Auto-expand projects if on projects page or in a project
      if (pathname?.startsWith("/projects")) {
        setExpandedItems((prev) =>
          prev.includes("проекты") ? prev : [...prev, "проекты"]
        );
      }
    }, [pathname, projectId]);

    const toggleExpand = (key: string) => {
      setExpandedItems((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

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
          {
            title: "Участники",
            href: `/projects/${projectId}/members`,
            icon: Users,
            children: [
              { title: "Команда", href: `/projects/${projectId}/members`, icon: UsersRound },
              { title: "Пользователи", href: `/projects/${projectId}/users`, icon: UserCircle },
            ],
          },
          { title: "Аналитика", href: `/projects/${projectId}/analytics`, icon: BarChart3 },
          {
            title: "Telegram",
            href: `/projects/${projectId}/integrations/telegram`,
            icon: Send,
          },
          {
            title: "Настройки",
            href: `/projects/${projectId}/settings`,
            icon: Settings,
            children: [
              { title: "Общие", href: `/projects/${projectId}/settings`, icon: Sliders },
          { title: "Секреты", href: `/projects/${projectId}/settings/secrets`, icon: Key },
            ],
          },
        ];
        sections.push({ title: currentProjectName || "Проект", items: projectItems });
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
          // История сессий временно скрыта - требует доработки
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
          { title: "Заявки", href: "/admin/requests", icon: FileText, adminOnly: true },
          {
            title: "Настройки платформы",
            href: "/admin/settings/platform",
            icon: Key,
            adminOnly: true,
          },
          {
            title: "Telegram-боты",
            href: "/admin/settings/telegram-notifications",
            icon: Send,
            adminOnly: true,
          },
          {
            title: "Логи уведомлений",
            href: "/admin/notifications/logs",
            icon: Bell,
            adminOnly: true,
          },
          { title: "Аудит логи", href: "/admin/audit", icon: Shield, adminOnly: true },
        ];
        sections.push({ title: "Администрирование", items: adminItems });
      }

      return sections;
    }, [projectId, avatarId, user, currentProjectName]);

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
                    <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted truncate" title={section.title}>
                      {section.title}
                    </h4>
                  )}
                  {section.items.map((item) => {
                    // Pages that should only match exactly (not their sub-pages)
                    const isProjectOverview = projectId && item.href === `/projects/${projectId}`;
                    const isAvatarSettings = projectId && avatarId && item.href === `/projects/${projectId}/avatars/${avatarId}`;
                    const requiresExactMatch = isProjectOverview || isAvatarSettings;
                    
                    const isActive = requiresExactMatch
                      ? pathname === item.href
                      : pathname === item.href ||
                      (item.href !== "/projects" && pathname?.startsWith(`${item.href}/`));
                    const hasChildren = item.children && item.children.length > 0;
                    const isChildActive = hasChildren && item.children?.some(
                      (child) => pathname === child.href || pathname?.startsWith(`${child.href}/`)
                    );
                    const isExpanded = expandedItems.includes(item.title.toLowerCase());
                    const Icon = item.icon;

                    // Special handling for "Проекты" menu item
                    if (item.title === "Проекты" && !collapsed) {
                      const isProjectsActive = pathname === "/projects" || pathname?.startsWith("/projects/");
                      return (
                        <div key={item.title}>
                          <button
                            onClick={() => toggleExpand(item.title.toLowerCase())}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                              isProjectsActive
                                ? "text-accent-primary"
                                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                            )}
                          >
                            <Icon className={cn("size-5 shrink-0", isProjectsActive && "text-accent-primary")} />
                            <span className="flex-1 text-left">{item.title}</span>
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3 overflow-hidden max-w-full">
                              {sidebarProjects.map((project) => {
                                const isProjectActive = pathname?.startsWith(`/projects/${project.id}`);
                                return (
                                  <Tooltip key={project.id}>
                                    <TooltipTrigger asChild>
                                      <Link
                                        href={`/projects/${project.id}`}
                                        className={cn(
                                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all overflow-hidden min-w-0",
                                          isProjectActive
                                            ? "bg-accent-primary/10 text-accent-primary"
                                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                                        )}
                                      >
                                        <Folder className={cn("size-4 shrink-0", isProjectActive && "text-accent-primary")} />
                                        <span className="truncate">{project.name}</span>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">{project.name}</TooltipContent>
                                  </Tooltip>
                                );
                              })}
                              <Link
                                href="/projects"
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                  pathname === "/projects"
                                    ? "bg-accent-primary/10 text-accent-primary"
                                    : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
                                )}
                              >
                                <FolderKanban className="size-4 shrink-0" />
                                <span>Все проекты</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Item with children (collapsible)
                    if (hasChildren && !collapsed) {
                      return (
                        <div key={item.title}>
                          <button
                            onClick={() => toggleExpand(item.title.toLowerCase())}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                              isChildActive
                                ? "text-accent-primary"
                                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                            )}
                          >
                            <Icon className={cn("size-5 shrink-0", isChildActive && "text-accent-primary")} />
                            <span className="flex-1 text-left">{item.title}</span>
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                              {item.children?.map((child) => {
                                // For items with same href as parent (like "Общие"), only exact match
                                const isExactMatch = pathname === child.href;
                                const isChildItemActive = child.href === item.href
                                  ? isExactMatch
                                  : isExactMatch || pathname?.startsWith(`${child.href}/`);
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                      isChildItemActive
                                        ? "bg-accent-primary/10 text-accent-primary"
                                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                                    )}
                                  >
                                    <ChildIcon className={cn("size-4 shrink-0", isChildItemActive && "text-accent-primary")} />
                                    <span>{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Regular item or collapsed mode
                    const linkContent = (
                      <Link
                        href={item.disabled ? "#" : item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isActive || isChildActive
                            ? "bg-accent-primary/10 text-accent-primary"
                            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                          item.disabled && "pointer-events-none opacity-50",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className={cn("size-5 shrink-0", (isActive || isChildActive) && "text-accent-primary")} />
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
                      href="/settings/notifications"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        pathname === "/settings/notifications" && "bg-accent-primary/10 text-accent-primary",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Bell className="size-5" />
                      {!collapsed && <span>Уведомления</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">Уведомления</TooltipContent>}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings/profile"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        pathname === "/settings/profile" && "bg-accent-primary/10 text-accent-primary",
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
                    <a
                      href="https://parmenid.tech/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <HelpCircle className="size-5" />
                      {!collapsed && <span>Помощь</span>}
                    </a>
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
