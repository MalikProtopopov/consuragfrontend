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
    className: "bg-bg-hover text-text-secondary border-border font-mono",
  },
  starter: {
    label: "Starter",
    className: "bg-info/10 text-info border-info/20 font-mono",
  },
  growth: {
    label: "Growth",
    className: "bg-success/10 text-success-strong border-success/20 font-mono",
  },
  scale: {
    label: "Scale",
    className: "bg-burgundy/10 text-burgundy border-burgundy/20 font-mono",
  },
  enterprise: {
    label: "Enterprise",
    className: "bg-[image:var(--gradient-primary)] text-[#0A0A0B] border-transparent font-mono",
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

