"use client";

import * as React from "react";

import Link from "next/link";

import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Settings, Sun, User } from "lucide-react";

import { cn } from "@/shared/lib";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import { useAuthStore, useLogout } from "@/entities/auth";

export interface BreadcrumbItemData {
  title: string;
  href?: string;
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  breadcrumbs?: BreadcrumbItemData[];
  onMenuClick?: () => void;
  showSearch?: boolean;
  onThemeToggle?: () => void;
  isDark?: boolean;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      breadcrumbs,
      onMenuClick,
      showSearch = false,
      onThemeToggle,
      isDark = false,
      ...props
    },
    ref
  ) => {
    const { user } = useAuthStore();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    const displayName = user?.full_name || user?.email || "Пользователь";
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-primary/60 px-4 sm:px-6",
          className
        )}
        {...props}
      >
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="size-5" />
          <span className="sr-only">Меню</span>
        </Button>

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href || "#"}>{item.title}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        {showSearch && (
          <div className="hidden md:flex relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input type="search" placeholder="Поиск..." className="pl-9 w-full" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {onThemeToggle && (
            <Button variant="ghost" size="icon" onClick={onThemeToggle}>
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
              <span className="sr-only">Переключить тему</span>
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="sr-only">Уведомления</span>
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-1">
                  <Avatar className="size-8">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={displayName} />}
                    <AvatarFallback className="bg-accent-primary/10 text-accent-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium text-text-primary">
                    {displayName}
                  </span>
                  <ChevronDown className="size-4 text-text-muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-text-muted">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User className="mr-2 size-4" />
                    Профиль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/password">
                    <Settings className="mr-2 size-4" />
                    Сменить пароль
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-error cursor-pointer"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 size-4" />
                  {isLoggingOut ? "Выход..." : "Выйти"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
    );
  }
);
Header.displayName = "Header";

export { Header };
export type { BreadcrumbItemData as BreadcrumbItem };
