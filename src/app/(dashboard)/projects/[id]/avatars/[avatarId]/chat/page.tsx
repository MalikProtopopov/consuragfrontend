"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, RefreshCw, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import { useAvatar } from "@/entities/avatar";
import { useChat } from "@/entities/chat";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib";
import type { ChatMessage } from "@/shared/types/api";

interface ChatPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading: avatarLoading } = useAvatar(projectId, avatarId);
  const {
    sessionId,
    messages,
    isLoading: chatLoading,
    isInitializing,
    sendMessage,
    resetChat,
    sendFeedback,
  } = useChat(avatarId, "web");

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput("");
    setIsSending(true);

    try {
      await sendMessage(message);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await resetChat();
    inputRef.current?.focus();
  };

  if (avatarLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[600px]" />
      </PageContainer>
    );
  }

  if (!avatar) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Аватар не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}/avatars/${avatarId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К аватару
          </Link>
        </Button>
        <Button variant="outline" onClick={handleNewChat} disabled={isInitializing}>
          {isInitializing ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Новый чат
        </Button>
      </div>

      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: avatar.primary_color
                  ? `${avatar.primary_color}20`
                  : "var(--color-accent-primary-10)",
              }}
            >
              <Bot
                className="size-5"
                style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
              />
            </div>
            <div>
              <CardTitle className="text-base">{avatar.name}</CardTitle>
              {sessionId && (
                <p className="text-xs text-text-muted">Сессия: {sessionId.slice(0, 8)}...</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* Initializing indicator */}
              {isInitializing && (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6 mr-2" />
                  <span className="text-sm text-text-muted">Загрузка чата...</span>
                </div>
              )}

              {/* Welcome message - only show when not initializing and no messages */}
              {!isInitializing && messages.length === 0 && avatar.welcome_message && (
                <MessageBubble
                  message={{
                    id: "welcome",
                    role: "assistant",
                    content: avatar.welcome_message,
                    created_at: new Date().toISOString(),
                  }}
                  avatar={avatar}
                />
              )}

              {/* Chat messages */}
              {!isInitializing && messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  avatar={avatar}
                  onFeedback={(feedback) => sendFeedback({ messageId: message.id, feedback })}
                />
              ))}

              {/* Typing indicator */}
              {(chatLoading || isSending) && (
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg shrink-0"
                    style={{
                      backgroundColor: avatar.primary_color
                        ? `${avatar.primary_color}20`
                        : "var(--color-accent-primary-10)",
                    }}
                  >
                    <Bot
                      className="size-4"
                      style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary">
                    <Spinner className="h-4 w-4" />
                    <span className="text-sm text-text-muted">Думаю...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите сообщение..."
                disabled={isSending || isInitializing}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isSending || isInitializing || !input.trim()}>
                {isSending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function MessageBubble({
  message,
  avatar,
  onFeedback,
}: {
  message: ChatMessage;
  avatar: { name: string; primary_color: string | null };
  onFeedback?: (feedback: "positive" | "negative") => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-lg shrink-0",
          isUser ? "bg-text-muted/20" : ""
        )}
        style={
          !isUser
            ? {
                backgroundColor: avatar.primary_color
                  ? `${avatar.primary_color}20`
                  : "var(--color-accent-primary-10)",
              }
            : undefined
        }
      >
        {isUser ? (
          <User className="size-4 text-text-muted" />
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
            "p-3 rounded-lg",
            isUser ? "bg-accent-primary text-accent-contrast" : "bg-bg-secondary"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                📄 {source.filename}
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

