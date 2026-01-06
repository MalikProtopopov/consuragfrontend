"use client";

import * as React from "react";

import { Bot, Check, Copy, Send, ThumbsDown, ThumbsUp, User } from "lucide-react";

import { cn } from "@/shared/lib";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Textarea } from "./textarea";

// Chat Message Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  sources?: ChatSource[];
  feedback?: "positive" | "negative" | null;
}

export interface ChatSource {
  id: string;
  title: string;
  snippet?: string;
}

// Chat Message Bubble
export interface ChatMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onCopy"> {
  message: ChatMessage;
  avatarUrl?: string;
  avatarName?: string;
  onFeedback?: (id: string, feedback: "positive" | "negative") => void;
  onCopyMessage?: (content: string) => void;
}

const ChatMessageBubble = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, message, avatarUrl, avatarName, onFeedback, onCopyMessage, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const isAssistant = message.role === "assistant";

    const handleCopy = () => {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyMessage?.(message.content);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3 animate-fade-up",
          isAssistant ? "flex-row" : "flex-row-reverse",
          className,
        )}
        {...props}
      >
        <Avatar className="size-8 shrink-0">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={avatarName || message.role} /> : null}
          <AvatarFallback
            className={cn(
              isAssistant ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground",
            )}
          >
            {isAssistant ? <Bot className="size-4" /> : <User className="size-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={cn("flex-1 space-y-2", isAssistant ? "pr-12" : "pl-12")}>
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              isAssistant
                ? "bg-surface-2 rounded-tl-sm"
                : "bg-primary text-primary-foreground rounded-tr-sm",
            )}
          >
            <div className={cn("prose-chat", !isAssistant && "text-inherit")}>
              {message.content}
            </div>
          </div>

          {/* Sources */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <button
                  key={source.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                >
                  {source.title}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {isAssistant && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" className="size-7" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span className="sr-only">Copy message</span>
              </Button>
              {onFeedback && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("size-7", message.feedback === "positive" && "text-success")}
                    onClick={() => onFeedback(message.id, "positive")}
                  >
                    <ThumbsUp className="size-3.5" />
                    <span className="sr-only">Good response</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn("size-7", message.feedback === "negative" && "text-destructive")}
                    onClick={() => onFeedback(message.id, "negative")}
                  >
                    <ThumbsDown className="size-3.5" />
                    <span className="sr-only">Bad response</span>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Timestamp */}
          {message.timestamp && (
            <p className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  },
);
ChatMessageBubble.displayName = "ChatMessageBubble";

// Chat Input Composer
export interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: (message: string) => void;
  loading?: boolean;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSend, loading = false, ...props }, ref) => {
    const [value, setValue] = React.useState("");

    const handleSend = () => {
      if (value.trim() && !loading) {
        onSend?.(value.trim());
        setValue("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className={cn("flex items-end gap-2 border rounded-xl bg-surface p-2", className)}>
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent min-h-[40px] max-h-[200px]"
          {...props}
        />
        <Button
          onClick={handleSend}
          disabled={!value.trim() || loading}
          size="icon"
          className="shrink-0"
        >
          <Send className="size-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    );
  },
);
ChatInput.displayName = "ChatInput";

// Chat Container
export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: ChatMessage[];
  avatarUrl?: string;
  avatarName?: string;
  onSend?: (message: string) => void;
  onFeedback?: (id: string, feedback: "positive" | "negative") => void;
  loading?: boolean;
  typing?: boolean;
}

const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  (
    {
      className,
      messages,
      avatarUrl,
      avatarName,
      onSend,
      onFeedback,
      loading = false,
      typing = false,
      ...props
    },
    ref,
  ) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <div ref={ref} className={cn("flex flex-col h-full", className)} {...props}>
        <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                avatarUrl={message.role === "assistant" ? avatarUrl : undefined}
                avatarName={avatarName}
                onFeedback={onFeedback}
              />
            ))}
            {typing && (
              <div className="flex gap-3 animate-fade-up">
                <Avatar className="size-8">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={avatarName || "Assistant"} />}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-surface-2 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="size-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="size-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="size-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t bg-background p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={onSend} loading={loading} />
          </div>
        </div>
      </div>
    );
  },
);
ChatContainer.displayName = "ChatContainer";

export { ChatMessageBubble, ChatInput, ChatContainer };
