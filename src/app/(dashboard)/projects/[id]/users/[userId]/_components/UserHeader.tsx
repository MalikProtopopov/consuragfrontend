"use client";

import { Ban, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { EndUserStatusBadge } from "@/shared/ui/status-badge";
import { getProviderIcon } from "./providerHelpers";
import type { EndUserDetailResponse } from "@/shared/types/api";

interface UserHeaderProps {
  user: EndUserDetailResponse;
  onSendMessage: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  isUnblocking: boolean;
}

export function UserHeader({
  user,
  onSendMessage,
  onBlock,
  onUnblock,
  isUnblocking,
}: UserHeaderProps) {
  const primaryIdentity = user.identities.find((i) => i.is_primary) || user.identities[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary text-2xl font-medium">
          {user.display_name ? user.display_name.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">
              {user.display_name || "Без имени"}
            </h1>
            <EndUserStatusBadge status={user.status} />
          </div>
          {primaryIdentity && (
            <p className="text-text-muted mt-1">
              {getProviderIcon(primaryIdentity.provider)}{" "}
              {primaryIdentity.username
                ? `@${primaryIdentity.username}`
                : `ID: ${primaryIdentity.external_id}`}
            </p>
          )}
          {user.blocked_reason && (
            <p className="text-sm text-destructive mt-1">
              Причина блокировки: {user.blocked_reason}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onSendMessage}
          disabled={user.status === "blocked"}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Написать
        </Button>
        {user.status === "active" ? (
          <Button variant="destructive" onClick={onBlock}>
            <Ban className="mr-2 h-4 w-4" />
            Заблокировать
          </Button>
        ) : user.status === "blocked" ? (
          <Button variant="outline" onClick={onUnblock} disabled={isUnblocking}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Разблокировать
          </Button>
        ) : null}
      </div>
    </div>
  );
}
