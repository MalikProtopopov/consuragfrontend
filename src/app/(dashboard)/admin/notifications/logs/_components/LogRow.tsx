"use client";

import { Eye } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { TableCell, TableRow } from "@/shared/ui/table";
import { formatDate } from "@/shared/lib";
import type { NotificationLog } from "@/shared/types/api";

import { notificationTypeLabels, statusConfig } from "./logMeta";

/**
 * Single notification log table row.
 */
export function LogRow({
  log,
  onViewDetails,
}: {
  log: NotificationLog;
  onViewDetails: () => void;
}) {
  const status = statusConfig[log.status];
  const StatusIcon = status.icon;

  const formattedDate = formatDate(log.created_at, "datetime-compact");

  return (
    <TableRow>
      <TableCell className="text-text-muted">{formattedDate}</TableCell>
      <TableCell>
        <span className="font-medium text-text-primary">
          {notificationTypeLabels[log.notification_type] || log.notification_type}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={log.recipient_type === "admin" ? "default" : "secondary"}>
          {log.recipient_type === "admin" ? "Admin" : "User"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
