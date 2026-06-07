import { type RefObject } from "react";
import { Spinner } from "@/shared/ui/spinner";
import type { Avatar as AvatarType, ChatMessage } from "@/shared/types/api";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  avatar: AvatarType;
  messages: ChatMessage[];
  isInitializing: boolean;
  isTyping: boolean;
  userAvatarUrl?: string | null;
  scrollRef: RefObject<HTMLDivElement | null>;
  onFeedback: (messageId: string, feedback: "positive" | "negative") => void;
}

export function ChatMessages({
  avatar,
  messages,
  isInitializing,
  isTyping,
  userAvatarUrl,
  scrollRef,
  onFeedback,
}: ChatMessagesProps) {
  return (
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
            userAvatarUrl={userAvatarUrl}
          />
        )}

        {/* Chat messages */}
        {!isInitializing &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              avatar={avatar}
              userAvatarUrl={userAvatarUrl}
              onFeedback={(feedback) => onFeedback(message.id, feedback)}
            />
          ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator avatar={avatar} />}
      </div>
    </div>
  );
}
