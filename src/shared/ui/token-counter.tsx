"use client";

import * as React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/**
 * Format large numbers to compact form (e.g., 65000 -> "65K")
 */
function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return value.toString();
}

/**
 * Get color based on usage percentage
 */
function getUsageColor(percent: number): string {
  if (percent >= 90) return "text-error";
  if (percent >= 70) return "text-warning";
  return "text-success";
}

interface TokenCounterProps {
  chatUsed: number;
  chatLimit: number;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const TokenCounter = React.forwardRef<HTMLAnchorElement, TokenCounterProps>(
  ({ chatUsed, chatLimit, showDetails = false, compact = false, className }, ref) => {
    const percent = chatLimit > 0 ? Math.round((chatUsed / chatLimit) * 100) : 0;
    const usageColor = getUsageColor(percent);

    if (compact) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              ref={ref}
              href={ROUTES.SETTINGS.USAGE}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                className
              )}
            >
              <Coins className="size-4" />
              <span className={usageColor}>
                {formatCompact(chatUsed)} / {formatCompact(chatLimit)}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <p className="font-medium">Использование токенов</p>
              <p className="text-text-muted">
                {chatUsed.toLocaleString()} / {chatLimit.toLocaleString()} ({percent}%)
              </p>
              <p className="text-xs text-text-muted">Нажмите для подробностей</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        ref={ref}
        href={ROUTES.SETTINGS.USAGE}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
          className
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent-primary/10">
          <Coins className="size-4 text-accent-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-text-primary">Токены</span>
            <span className={cn("text-xs font-medium", usageColor)}>{percent}%</span>
          </div>
          {showDetails && (
            <p className="text-xs text-text-muted truncate">
              {formatCompact(chatUsed)} / {formatCompact(chatLimit)}
            </p>
          )}
        </div>
      </Link>
    );
  }
);
TokenCounter.displayName = "TokenCounter";

export { TokenCounter };

