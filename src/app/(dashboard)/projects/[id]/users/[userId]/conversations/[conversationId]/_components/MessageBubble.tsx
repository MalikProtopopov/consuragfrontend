"use client";

import { User, Bot, MessageSquare, Zap, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn, formatTime } from "@/shared/lib";
import type { ConversationMessage } from "@/shared/types/api";

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.direction === "in" || message.role === "user";
  const isAssistant = message.role === "assistant";
  const isAdmin = message.role === "admin";

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-accent-primary/10"
            : isAssistant
              ? "bg-[#0088cc]/10"
              : isAdmin
                ? "bg-amber-500/10"
                : "bg-bg-hover"
        )}
      >
        {isUser ? (
          <User className="size-4 text-accent-primary" />
        ) : isAssistant ? (
          <Bot className="size-4 text-[#0088cc]" />
        ) : isAdmin ? (
          <User className="size-4 text-amber-500" />
        ) : (
          <MessageSquare className="size-4 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">
            {isUser
              ? "Пользователь"
              : isAssistant
                ? "AI Ассистент"
                : isAdmin
                  ? "Администратор"
                  : "Система"}
          </span>
          <span className="text-xs text-text-muted">{formatTime(message.created_at)}</span>
          {message.total_tokens > 0 && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {message.total_tokens}
            </span>
          )}
          {message.model_used && (
            <span className="text-xs text-text-muted">{message.model_used}</span>
          )}
          {message.feedback && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                message.feedback === "positive" ? "text-green-500" : "text-red-500"
              )}
            >
              {message.feedback === "positive" ? (
                <ThumbsUp className="h-3 w-3" />
              ) : (
                <ThumbsDown className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg max-w-full",
            isUser
              ? "bg-accent-primary/10"
              : isAssistant
                ? "bg-bg-hover"
                : isAdmin
                  ? "bg-amber-500/10"
                  : "bg-bg-secondary"
          )}
        >
          <p
            className="text-sm text-text-secondary whitespace-pre-wrap break-words"
            style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
