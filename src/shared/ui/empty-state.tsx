"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib";
import { DotPattern } from "./dot-pattern";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * EmptyState — терминальная «панель» вместо shadcn-клише «серый круг с иконкой».
 * Тонкая рамка-панель с DotPattern-подложкой (маска к центру), внутри —
 * mono-подсказка `$ <icon> nothing_here`, заголовок в mono с мигающим курсором,
 * описание обычным текстом и опциональная action-кнопка.
 * API (icon/title/description/action) сохранён — call-sites не меняются.
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative isolate overflow-hidden rounded-xl border border-border px-6 py-12 text-center",
          className,
        )}
        {...props}
      >
        <DotPattern
          width={16}
          height={16}
          cr={1}
          className={cn(
            "opacity-60",
            "[mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]",
          )}
        />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Терминальная строка-подсказка */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 py-1.5 font-mono text-xs text-text-muted">
            <span className="text-primary-link select-none">$</span>
            {Icon && <Icon className="size-3.5" aria-hidden />}
            <span>nothing_here</span>
          </div>

          {/* Заголовок в mono с префиксом $ и мигающим курсором */}
          <h3 className="font-mono text-base font-semibold text-text-primary">
            <span className="mr-1.5 text-primary-link select-none">$</span>
            {title}
            <span
              aria-hidden
              className="ml-0.5 inline-block animate-cursor-blink motion-reduce:animate-none"
            >
              _
            </span>
          </h3>

          {description && (
            <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
          )}

          {action && <div className="mt-6">{action}</div>}
        </div>
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
