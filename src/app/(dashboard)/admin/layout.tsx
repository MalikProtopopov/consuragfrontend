"use client";

import type { ReactNode } from "react";
import { useAuthStore, isAdmin } from "@/entities/auth";
import { PageContainer } from "@/widgets/app-shell";
import { AccessDenied } from "@/shared/ui/access-denied";

/**
 * Admin-зона: in-page guard (R-05, defense-in-depth поверх middleware).
 * Если пользователь загружен и НЕ платформенный админ — показываем «нет доступа»
 * вместо рендера админ-страниц. Пока user не загружен — пропускаем (middleware уже гейтит).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (user && !isAdmin(user)) {
    return (
      <PageContainer>
        <AccessDenied
          message="Этот раздел доступен только администраторам платформы."
          backHref="/projects"
        />
      </PageContainer>
    );
  }

  return <>{children}</>;
}
