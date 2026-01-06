"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Pause,
  MoreVertical,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type ConfigStatus = "set_active" | "set_inactive" | "not_set" | "invalid";

interface ConfigCardProps {
  keyType: string;
  displayName: string;
  description?: string | null;
  maskedValue?: string;
  isSet: boolean;
  isActive: boolean;
  updatedAt?: string;
  onEdit: () => void;
  onDelete?: () => void;
  onValidate?: () => void;
  showValidate?: boolean;
  className?: string;
}

function getConfigStatus(isSet: boolean, isActive: boolean): ConfigStatus {
  if (!isSet) return "not_set";
  if (isActive) return "set_active";
  return "set_inactive";
}

const statusConfig: Record<
  ConfigStatus,
  { icon: React.ElementType; label: string; className: string }
> = {
  set_active: {
    icon: CheckCircle2,
    label: "Активен",
    className: "text-success",
  },
  set_inactive: {
    icon: Pause,
    label: "Отключен",
    className: "text-warning",
  },
  not_set: {
    icon: XCircle,
    label: "Не установлен",
    className: "text-text-muted",
  },
  invalid: {
    icon: XCircle,
    label: "Недействителен",
    className: "text-error",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format masked value to show only 5 dots + last visible characters
function formatMaskedValue(maskedValue: string): string {
  const lastDotIndex = maskedValue.lastIndexOf("•");
  if (lastDotIndex === -1) return maskedValue;
  
  const suffix = maskedValue.slice(lastDotIndex + 1);
  return "•••••" + suffix;
}

const ConfigCard = React.forwardRef<HTMLDivElement, ConfigCardProps>(
  (
    {
      keyType,
      displayName,
      description,
      maskedValue,
      isSet,
      isActive,
      updatedAt,
      onEdit,
      onDelete,
      onValidate,
      showValidate = false,
      className,
    },
    ref
  ) => {
    const status = getConfigStatus(isSet, isActive);
    const StatusIcon = statusConfig[status].icon;

    return (
      <Card ref={ref} className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header */}
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-text-primary truncate">
                  {displayName}
                </h4>
                <code className="text-xs text-text-muted bg-bg-hover px-1.5 py-0.5 rounded">
                  {keyType}
                </code>
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {description}
                </p>
              )}

              {/* Masked Value */}
              <div className="flex items-center gap-2 min-w-0">
                {isSet && maskedValue ? (
                  <code className="text-sm font-mono text-text-secondary bg-bg-hover px-2 py-1 rounded">
                    {formatMaskedValue(maskedValue)}
                  </code>
                ) : (
                  <span className="text-sm text-text-muted italic">
                    Не установлен
                  </span>
                )}
              </div>

              {/* Status and Date */}
              <div className="flex items-center gap-3 text-xs">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    statusConfig[status].className
                  )}
                >
                  <StatusIcon className="size-3.5" />
                  {statusConfig[status].label}
                </span>
                {updatedAt && (
                  <span className="text-text-muted">
                    Обновлено: {formatDate(updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {showValidate && isSet && onValidate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onValidate}
                  className="text-text-secondary"
                >
                  <ShieldCheck className="size-4 mr-1" />
                  Проверить
                </Button>
              )}

              {!isSet ? (
                <Button variant="default" size="sm" onClick={onEdit}>
                  Добавить
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Действия</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="size-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    {showValidate && onValidate && (
                      <DropdownMenuItem onClick={onValidate}>
                        <ShieldCheck className="size-4 mr-2" />
                        Проверить ключ
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={onDelete}
                          className="text-error focus:text-error"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
ConfigCard.displayName = "ConfigCard";

export { ConfigCard };
export type { ConfigCardProps, ConfigStatus };

