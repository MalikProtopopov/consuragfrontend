"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  FileText,
  BarChart3,
  Users,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  disabled?: boolean
  adminOnly?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

const defaultNavSections: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Avatars", href: "/avatars", icon: Bot },
      { title: "Documents", href: "/documents", icon: FileText },
      { title: "Chat", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Platform Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Audit Logs", href: "/audit-logs", icon: FileText },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users", href: "/users", icon: Users, adminOnly: true },
      { title: "Telegram Integration", href: "/integrations/telegram", icon: Send },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  navSections?: NavSection[]
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  logo?: React.ReactNode
  footer?: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      navSections = defaultNavSections,
      collapsed = false,
      onCollapsedChange,
      logo,
      footer,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname()

    return (
      <TooltipProvider delayDuration={0}>
        <aside
          ref={ref}
          data-collapsed={collapsed}
          className={cn(
            "group/sidebar relative flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
            collapsed ? "w-[68px]" : "w-[260px]",
            className
          )}
          {...props}
        >
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-4">
            {logo || (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
                  A
                </div>
                {!collapsed && (
                  <span className="font-semibold text-lg">Avatar AI</span>
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
                    <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h4>
                  )}
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    const Icon = item.icon

                    const linkContent = (
                      <Link
                        href={item.disabled ? "#" : item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                          item.disabled && "pointer-events-none opacity-50",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <Icon className={cn("size-5 shrink-0", isActive && "text-sidebar-primary")} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    )

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return <React.Fragment key={item.href}>{linkContent}</React.Fragment>
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="mt-auto border-t p-3 space-y-1">
            {footer || (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/help"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <HelpCircle className="size-5" />
                      {!collapsed && <span>Help & Support</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">Help & Support</TooltipContent>
                  )}
                </Tooltip>
              </>
            )}
          </div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute -right-3 top-20 z-10 size-6 rounded-full border bg-background shadow-sm"
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </aside>
      </TooltipProvider>
    )
  }
)
Sidebar.displayName = "Sidebar"

export { Sidebar }

