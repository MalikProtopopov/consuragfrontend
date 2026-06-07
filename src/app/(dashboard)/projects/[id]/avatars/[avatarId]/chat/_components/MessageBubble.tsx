"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import type { Components } from "react-markdown";
import { ThumbsUp, ThumbsDown, Bot, User, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib";
import type { ChatMessage, Avatar as AvatarType } from "@/shared/types/api";

// react-markdown тянет remark/rehype-граф — грузим его динамически, только на
// странице чата, чтобы не утяжелять общий бандл (T-26). ssr:false + скелетон.
const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
  loading: () => <Skeleton className="h-4 w-40" />,
});

/**
 * T-27: react-markdown v10 по умолчанию НЕ рендерит сырой HTML (rehype-raw не
 * подключён) — `<img onerror=...>` экранируется. Для явности оставляем
 * `skipHtml`. Ссылки открываем в новой вкладке с rel="noopener noreferrer".
 */
const markdownComponents: Components = {
  a: ({ children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export function MessageBubble({
  message,
  avatar,
  userAvatarUrl,
  onFeedback,
}: {
  message: ChatMessage;
  avatar: AvatarType;
  userAvatarUrl?: string | null;
  onFeedback?: (feedback: "positive" | "negative") => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full shrink-0 overflow-hidden",
          isUser ? "bg-text-muted/20" : "border-2"
        )}
        style={
          !isUser
            ? {
                backgroundColor: avatar.primary_color
                  ? `${avatar.primary_color}15`
                  : "var(--color-bg-secondary)",
                borderColor: avatar.primary_color || "var(--color-accent-primary)",
              }
            : undefined
        }
      >
        {isUser ? (
          userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt="Вы"
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <User className="size-4 text-text-muted" />
          )
        ) : avatar.avatar_image_url ? (
          <Image
            src={avatar.avatar_image_url}
            alt={avatar.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <Bot
            className="size-4"
            style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("max-w-[80%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "p-3 rounded-2xl relative",
            isUser
              ? "bg-accent-primary text-accent-contrast rounded-tr-md"
              : "bg-bg-tertiary border border-border rounded-tl-md"
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:bg-bg-secondary prose-pre:text-text-primary prose-code:text-accent-primary prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown skipHtml components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs gap-1">
                <FileText className="inline size-3.5" />
                {source.filename}
              </Badge>
            ))}
          </div>
        )}

        {/* Feedback */}
        {!isUser && message.id !== "welcome" && onFeedback && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                message.feedback === "positive" && "text-success bg-success/10"
              )}
              onClick={() => onFeedback("positive")}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                message.feedback === "negative" && "text-error bg-error/10"
              )}
              onClick={() => onFeedback("negative")}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
