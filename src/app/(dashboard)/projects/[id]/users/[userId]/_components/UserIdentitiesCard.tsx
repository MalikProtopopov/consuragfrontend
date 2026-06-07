"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { cn, formatRelativeTime } from "@/shared/lib";
import { getProviderIcon, getProviderLabel } from "./providerHelpers";
import type { UserIdentity } from "@/shared/types/api";

interface UserIdentitiesCardProps {
  identities: UserIdentity[];
}

export function UserIdentitiesCard({ identities }: UserIdentitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Идентичности</CardTitle>
        <CardDescription>Каналы связи пользователя</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {identities.map((identity) => (
          <div
            key={identity.id}
            className={cn(
              "p-4 rounded-lg border",
              identity.is_primary ? "border-accent-primary bg-accent-primary/5" : "border-border"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getProviderIcon(identity.provider)}</span>
                <span className="font-medium">{getProviderLabel(identity.provider)}</span>
                {identity.is_primary && (
                  <Badge variant="secondary" className="text-xs">
                    Основной
                  </Badge>
                )}
              </div>
              {identity.is_reachable && (
                <Badge variant="success" className="text-xs">
                  Доступен
                </Badge>
              )}
            </div>
            <div className="text-sm space-y-1 text-text-secondary">
              {identity.username && <p>@{identity.username}</p>}
              {identity.first_name && (
                <p>
                  {identity.first_name} {identity.last_name}
                </p>
              )}
              <p className="text-text-muted">ID: {identity.external_id}</p>
              {identity.language_code && (
                <p className="text-text-muted">Язык: {identity.language_code}</p>
              )}
              {identity.last_activity_at && (
                <p className="text-text-muted">
                  Последняя активность: {formatRelativeTime(identity.last_activity_at)}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
