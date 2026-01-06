"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-bg-secondary">
            <Icon className="size-8 text-text-muted" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-text-secondary max-w-sm">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
