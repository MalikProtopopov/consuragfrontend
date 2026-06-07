import { Bot } from "lucide-react";
import { CardHeader, CardTitle } from "@/shared/ui/card";
import type { Avatar as AvatarType } from "@/shared/types/api";

export function ChatHeader({
  avatar,
  sessionId,
}: {
  avatar: AvatarType;
  sessionId: string | null;
}) {
  return (
    <CardHeader className="border-b border-border py-4">
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl overflow-hidden"
          style={{
            backgroundColor: avatar.primary_color
              ? `${avatar.primary_color}20`
              : "var(--color-accent-primary-10)",
          }}
        >
          {avatar.avatar_image_url ? (
            <img
              src={avatar.avatar_image_url}
              alt={avatar.name}
              className="size-full object-cover"
            />
          ) : (
            <Bot
              className="size-5"
              style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
            />
          )}
        </div>
        <div>
          <CardTitle className="text-base">{avatar.name}</CardTitle>
          {sessionId && (
            <p className="text-xs text-text-muted">Сессия: {sessionId.slice(0, 8)}...</p>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
