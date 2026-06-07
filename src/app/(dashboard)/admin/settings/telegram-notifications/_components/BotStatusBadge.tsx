"use client";

import { Check, X } from "lucide-react";

import { ActiveStatusBadge } from "@/shared/ui/status-badge";

/**
 * Configured/not-configured badge for a telegram bot, with optional @username.
 */
export function BotStatusBadge({
  configured,
  username,
}: {
  configured: boolean;
  username?: string;
}) {
  return (
    <ActiveStatusBadge
      active={configured}
      label={
        configured ? (
          <>
            <Check className="mr-1 h-3 w-3" />
            {username ? `@${username}` : "Настроен"}
          </>
        ) : (
          <>
            <X className="mr-1 h-3 w-3" />
            Не настроен
          </>
        )
      }
    />
  );
}
