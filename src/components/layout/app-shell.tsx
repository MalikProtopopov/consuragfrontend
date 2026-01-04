"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarProps, NavSection } from "./sidebar"
import { Header, HeaderProps } from "./header"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebarProps?: Partial<SidebarProps>
  headerProps?: Partial<HeaderProps>
  navSections?: NavSection[]
  user?: {
    name: string
    email: string
    avatarUrl?: string
  }
  defaultCollapsed?: boolean
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      className,
      sidebarProps,
      headerProps,
      navSections,
      user,
      defaultCollapsed = false,
      children,
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [isDark, setIsDark] = React.useState(false)

    // Theme toggle
    const toggleTheme = () => {
      const newIsDark = !isDark
      setIsDark(newIsDark)
      document.documentElement.classList.toggle("dark", newIsDark)
    }

    return (
      <div
        ref={ref}
        className={cn("flex h-screen overflow-hidden bg-background", className)}
        {...props}
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            navSections={navSections}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            {...sidebarProps}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar
              navSections={navSections}
              collapsed={false}
              className="border-0 w-full"
              {...sidebarProps}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            user={user}
            onMenuClick={() => setMobileOpen(true)}
            onThemeToggle={toggleTheme}
            isDark={isDark}
            {...headerProps}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    )
  }
)
AppShell.displayName = "AppShell"

// Page Container - for consistent page padding
export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const pageMaxWidths = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth = "2xl", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
          pageMaxWidths[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageContainer.displayName = "PageContainer"

// Page Header - for consistent page titles and actions
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between",
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {children}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { AppShell, PageContainer, PageHeader }

