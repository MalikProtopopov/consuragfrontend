"use client";

import * as React from "react";
import { cn } from "@/shared/lib";
import type { BillingPlan } from "@/shared/types/api";

const planConfig: Record<
  BillingPlan,
  { label: string; className: string; icon?: string }
> = {
  free: {
    label: "Free",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
  starter: {
    label: "Starter",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  growth: {
    label: "Growth",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  scale: {
    label: "Scale",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  enterprise: {
    label: "Enterprise",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: "✦",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
} as const;

interface PlanBadgeProps {
  plan: BillingPlan;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PlanBadge = React.forwardRef<HTMLSpanElement, PlanBadgeProps>(
  ({ plan, size = "md", className }, ref) => {
    const config = planConfig[plan];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-medium",
          config.className,
          sizeClasses[size],
          className
        )}
      >
        {config.icon && <span>{config.icon}</span>}
        {config.label}
      </span>
    );
  }
);
PlanBadge.displayName = "PlanBadge";

export { PlanBadge };

