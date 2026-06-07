"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Settings,
  BarChart3,
  Shield,
  User,
  Folder,
} from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/ui/command";
import { useProjects } from "@/entities/project";
import { useAuthStore, isAdmin } from "@/entities/auth";

/**
 * N-03 — командная палитра (⌘K / Ctrl+K): быстрый переход по разделам и проектам.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { data: projectsData } = useProjects();
  const { user } = useAuthStore();
  const projects = projectsData?.items ?? [];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpenEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Командная палитра">
      <CommandInput placeholder="Переход или команда…" />
      <CommandList>
        <CommandEmpty>Ничего не найдено</CommandEmpty>
        <CommandGroup heading="Переходы">
          <CommandItem value="проекты" onSelect={() => go("/projects")}>
            <FolderKanban className="mr-2 size-4" />
            Проекты
          </CommandItem>
          <CommandItem value="создать проект" onSelect={() => go("/projects/new")}>
            <Plus className="mr-2 size-4" />
            Создать проект
          </CommandItem>
          <CommandItem value="профиль настройки" onSelect={() => go("/settings/profile")}>
            <User className="mr-2 size-4" />
            Профиль
          </CommandItem>
          <CommandItem value="использование лимиты токены тариф" onSelect={() => go("/settings/usage")}>
            <BarChart3 className="mr-2 size-4" />
            Использование и лимиты
          </CommandItem>
          <CommandItem value="уведомления telegram" onSelect={() => go("/settings/notifications")}>
            <Settings className="mr-2 size-4" />
            Уведомления
          </CommandItem>
          {isAdmin(user) && (
            <CommandItem value="админка платформа администрирование" onSelect={() => go("/admin/analytics")}>
              <Shield className="mr-2 size-4" />
              Админка платформы
            </CommandItem>
          )}
        </CommandGroup>

        {projects.length > 0 && (
          <CommandGroup heading="Проекты">
            {projects.slice(0, 12).map((p) => (
              <CommandItem
                key={p.id}
                value={`проект ${p.name} ${p.slug}`}
                onSelect={() => go(`/projects/${p.id}`)}
              >
                <Folder className="mr-2 size-4" />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
