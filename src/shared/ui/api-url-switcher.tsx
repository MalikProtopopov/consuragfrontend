"use client";

import * as React from "react";
import { Server, RotateCcw, X } from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { apiUrlManager, API_ENVIRONMENTS } from "@/shared/lib";
import { cn } from "@/shared/lib";

interface ApiUrlSwitcherProps {
  className?: string;
}

/**
 * API URL Switcher component
 * Shows a floating panel to switch between dev and prod API endpoints
 * Visible by default in development mode, can be toggled with Ctrl+Shift+A
 */
export function ApiUrlSwitcher({ className }: ApiUrlSwitcherProps) {
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const [hasOverride, setHasOverride] = React.useState(false);
  // Show by default in development mode
  const [isVisible, setIsVisible] = React.useState(process.env.NODE_ENV === "development");

  React.useEffect(() => {
    setCurrentUrl(apiUrlManager.getApiUrl());
    setHasOverride(apiUrlManager.hasOverride());
  }, []);

  const handleChange = (value: string) => {
    apiUrlManager.setApiUrl(value);
  };

  const handleReset = () => {
    apiUrlManager.clearOverride();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+A)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) {
    return null;
  }

  // Determine if we're on prod
  const isProd = currentUrl.includes("parmenid.tech");

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg border bg-bg-secondary p-3 shadow-lg",
        isProd ? "border-success/50" : "border-warning/50",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server
              className={cn(
                "size-4",
                isProd ? "text-success" : "text-warning"
              )}
            />
            <span className="text-xs font-medium text-text-primary">
              API: {isProd ? "PROD" : "DEV"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 -mr-1 -mt-1"
            onClick={handleClose}
            title="Скрыть панель"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={currentUrl} onValueChange={handleChange}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_ENVIRONMENTS.map((env) => (
                <SelectItem key={env.value} value={env.value} className="text-xs">
                  {env.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasOverride && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleReset}
              title="Сбросить к настройкам .env"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>

        <p className="text-[10px] text-text-muted">
          Ctrl+Shift+A — показать/скрыть
        </p>
      </div>
    </div>
  );
}

