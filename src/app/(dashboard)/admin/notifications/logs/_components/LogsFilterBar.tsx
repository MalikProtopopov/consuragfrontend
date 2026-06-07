"use client";

import { Filter } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { NotificationStatus, NotificationType } from "@/shared/types/api";

import { notificationTypeLabels } from "./logMeta";

export type RecipientFilter = "admin" | "user" | "all";

/**
 * Type / recipient / status filter controls for the logs table.
 */
export function LogsFilterBar({
  typeFilter,
  recipientFilter,
  statusFilter,
  onTypeChange,
  onRecipientChange,
  onStatusChange,
  onReset,
}: {
  typeFilter: NotificationType | "all";
  recipientFilter: RecipientFilter;
  statusFilter: NotificationStatus | "all";
  onTypeChange: (value: NotificationType | "all") => void;
  onRecipientChange: (value: RecipientFilter) => void;
  onStatusChange: (value: NotificationStatus | "all") => void;
  onReset: () => void;
}) {
  const hasActiveFilters =
    typeFilter !== "all" || recipientFilter !== "all" || statusFilter !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-text-muted" />

      <Select
        value={typeFilter}
        onValueChange={(value) => onTypeChange(value as NotificationType | "all")}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          {Object.entries(notificationTypeLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={recipientFilter}
        onValueChange={(value) => onRecipientChange(value as RecipientFilter)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Получатель" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as NotificationStatus | "all")}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="sent">Отправлено</SelectItem>
          <SelectItem value="failed">Ошибка</SelectItem>
          <SelectItem value="pending">Ожидание</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Сбросить
        </Button>
      )}
    </div>
  );
}
