import { Bot } from "lucide-react";
import { Spinner } from "@/shared/ui/spinner";
import type { Avatar as AvatarType } from "@/shared/types/api";

export function TypingIndicator({ avatar }: { avatar: AvatarType }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex size-9 items-center justify-center rounded-full shrink-0 overflow-hidden border-2"
        style={{
          backgroundColor: avatar.primary_color
            ? `${avatar.primary_color}15`
            : "var(--color-bg-secondary)",
          borderColor: avatar.primary_color || "var(--color-accent-primary)",
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
            className="size-4"
            style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
          />
        )}
      </div>
      <div className="flex items-center gap-2 p-3 rounded-2xl rounded-tl-md bg-bg-tertiary border border-border">
        <Spinner className="h-4 w-4" />
        <span className="text-sm text-text-muted">Думаю...</span>
      </div>
    </div>
  );
}
