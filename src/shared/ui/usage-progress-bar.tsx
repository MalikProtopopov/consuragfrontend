"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/shared/lib";

/**
 * Format large numbers to compact form (e.g., 65000 -> "65K")
 */
function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * Get color scheme based on usage percentage
 */
function getColorScheme(percent: number): "green" | "yellow" | "red" {
  if (percent >= 90) return "red";
  if (percent >= 70) return "yellow";
  return "green";
}

const colorClasses = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-error",
} as const;

const backgroundColorClasses = {
  green: "bg-success/20",
  yellow: "bg-warning/20",
  red: "bg-error/20",
} as const;

interface UsageProgressBarProps {
  used: number;
  limit: number;
  bonus?: number;
  label: string;
  showPercent?: boolean;
  colorScheme?: "green" | "yellow" | "red" | "auto";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const UsageProgressBar = React.forwardRef<HTMLDivElement, UsageProgressBarProps>(
  (
    {
      used,
      limit,
      bonus = 0,
      label,
      showPercent = true,
      colorScheme = "auto",
      size = "md",
      className,
    },
    ref
  ) => {
    const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const actualColorScheme = colorScheme === "auto" ? getColorScheme(percent) : colorScheme;
    const totalAvailable = limit + bonus;

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {/* Header with label and values */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-primary">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">
              {formatTokens(used)} / {formatTokens(limit)}
            </span>
            {showPercent && (
              <span
                className={cn(
                  "font-medium",
                  actualColorScheme === "green" && "text-success",
                  actualColorScheme === "yellow" && "text-warning",
                  actualColorScheme === "red" && "text-error"
                )}
              >
                ({Math.round(percent)}%)
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <ProgressPrimitive.Root
          className={cn(
            "relative w-full overflow-hidden rounded-full",
            backgroundColorClasses[actualColorScheme],
            sizeClasses[size]
          )}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all duration-300 ease-in-out",
              colorClasses[actualColorScheme]
            )}
            style={{ transform: `translateX(-${100 - percent}%)` }}
          />
        </ProgressPrimitive.Root>

        {/* Bonus tokens info */}
        {bonus > 0 && (
          <p className="text-xs text-text-muted">
            + {formatTokens(bonus)} бонусных токенов (всего: {formatTokens(totalAvailable)})
          </p>
        )}
      </div>
    );
  }
);
UsageProgressBar.displayName = "UsageProgressBar";

export { UsageProgressBar, formatTokens, getColorScheme };

