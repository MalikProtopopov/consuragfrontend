"use client";

import { AlertCircle } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { ScrollArea } from "@/shared/ui/scroll-area";
import type { NotificationLog } from "@/shared/types/api";

import { notificationTypeLabels, statusConfig } from "./logMeta";

/**
 * Notification log details modal.
 */
export function LogDetailsModal({
  log,
  onClose,
}: {
  log: NotificationLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  const status = statusConfig[log.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(log.created_at).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Dialog open={!!log} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Детали уведомления</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and type */}
          <div className="flex items-center justify-between">
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline">
              {notificationTypeLabels[log.notification_type] || log.notification_type}
            </Badge>
          </div>

          {/* Info grid */}
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Дата/время:</span>
              <span className="text-text-primary">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Получатель:</span>
              <span className="text-text-primary">
                {log.recipient_type === "admin" ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Канал:</span>
              <span className="text-text-primary">{log.channel}</span>
            </div>
            {log.recipient_id && (
              <div className="flex justify-between">
                <span className="text-text-muted">ID получателя:</span>
                <span className="text-text-primary font-mono text-xs">
                  {log.recipient_id}
                </span>
              </div>
            )}
          </div>

          {/* Error message */}
          {log.error_message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{log.error_message}</AlertDescription>
            </Alert>
          )}

          {/* Message preview */}
          {log.message_preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Превью сообщения:</p>
              <ScrollArea className="h-[200px]">
                <pre className="text-sm text-text-secondary whitespace-pre-wrap bg-bg-secondary rounded-lg p-4">
                  {log.message_preview}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Метаданные:</p>
              <ScrollArea className="h-[100px]">
                <pre className="text-xs text-text-muted bg-bg-secondary rounded-lg p-3 overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
