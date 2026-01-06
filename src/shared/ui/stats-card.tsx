"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib";
import { Card, CardContent } from "./card";

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, description, icon: Icon, trend, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-muted">{title}</p>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              {description && (
                <p className="text-xs text-text-muted">{description}</p>
              )}
              {trend && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-success" : "text-error"
                  )}
                >
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            {Icon && (
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
                <Icon className="size-5 text-accent-primary" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
StatsCard.displayName = "StatsCard";

export { StatsCard };
