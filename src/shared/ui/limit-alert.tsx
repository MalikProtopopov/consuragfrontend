"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, TrendingUp, X } from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { Button } from "./button";

type AlertLevel = "warning" | "critical" | "exceeded";

function getAlertLevel(usagePercent: number): AlertLevel | null {
  if (usagePercent >= 100) return "exceeded";
  if (usagePercent >= 90) return "critical";
  if (usagePercent >= 80) return "warning";
  return null;
}

const alertConfig: Record<
  AlertLevel,
  { title: string; bgClass: string; borderClass: string; iconClass: string }
> = {
  warning: {
    title: "Приближение к лимиту",
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
  },
  critical: {
    title: "Критический уровень использования",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/30",
    iconClass: "text-orange-500",
  },
  exceeded: {
    title: "Лимит токенов исчерпан",
    bgClass: "bg-error/10",
    borderClass: "border-error/30",
    iconClass: "text-error",
  },
};

interface LimitAlertProps {
  usagePercent: number;
  daysRemaining: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const LimitAlert = React.forwardRef<HTMLDivElement, LimitAlertProps>(
  ({ usagePercent, daysRemaining, onUpgrade, onDismiss, className }, ref) => {
    const router = useRouter();
    const [isDismissed, setIsDismissed] = React.useState(false);

    const alertLevel = getAlertLevel(usagePercent);

    // Also show if few days remaining and usage > 50%
    const shouldShowDaysWarning = daysRemaining <= 3 && usagePercent > 50;

    if ((!alertLevel && !shouldShowDaysWarning) || isDismissed) {
      return null;
    }

    const config = alertLevel
      ? alertConfig[alertLevel]
      : alertConfig.warning; // Default to warning for days remaining

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    const handleUpgrade = () => {
      if (onUpgrade) {
        onUpgrade();
      } else {
        router.push(ROUTES.SETTINGS.USAGE);
      }
    };

    const getMessage = () => {
      if (usagePercent >= 100) {
        return "Вы использовали все доступные токены за этот период. Улучшите план или дождитесь сброса.";
      }
      if (usagePercent >= 90) {
        return `Осталось менее 10% токенов! Использовано ${Math.round(usagePercent)}% от лимита.`;
      }
      if (usagePercent >= 80) {
        return `Вы использовали ${Math.round(usagePercent)}% токенов за этот период.`;
      }
      if (shouldShowDaysWarning) {
        return `До сброса лимитов осталось ${daysRemaining} дн., использовано ${Math.round(usagePercent)}% токенов.`;
      }
      return "";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg border p-4",
          config.bgClass,
          config.borderClass,
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className={cn("size-5 shrink-0 mt-0.5", config.iconClass)} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-text-primary">{config.title}</h4>
            <p className="mt-1 text-sm text-text-secondary">{getMessage()}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={handleUpgrade}>
                <TrendingUp className="size-4 mr-1.5" />
                Улучшить план
              </Button>
              {usagePercent < 100 && (
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Позже
                </Button>
              )}
            </div>
          </div>
          {usagePercent < 100 && onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="size-4" />
              <span className="sr-only">Закрыть</span>
            </Button>
          )}
        </div>
      </div>
    );
  }
);
LimitAlert.displayName = "LimitAlert";

export { LimitAlert, getAlertLevel };

