"use client";

import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { ScrollArea } from "@/shared/ui/scroll-area";
import type { Conversation, ConversationMessage } from "@/shared/types/api";
import { MessageBubble } from "./MessageBubble";

export function ConversationMessages({
  conversation,
  messages,
  canSend,
  messageText,
  isSending,
  onMessageChange,
  onSend,
}: {
  conversation: Conversation;
  messages: ConversationMessage[];
  canSend: boolean;
  messageText: string;
  isSending: boolean;
  onMessageChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История сообщений</CardTitle>
        <CardDescription>
          {messages.length} сообщений • {conversation.user_messages_count} от пользователя,{" "}
          {conversation.assistant_messages_count} от ассистента
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-text-muted mb-3" />
            <p className="text-text-secondary">Нет сообщений</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Send message form */}
        {canSend && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                placeholder="Написать сообщение от имени бота..."
                value={messageText}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={2}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button
                onClick={onSend}
                disabled={!messageText.trim() || isSending}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Сообщение будет отправлено от имени бота в {conversation.channel}
              {conversation.status !== "active" &&
                " · диалог неактивен — отправка продолжит текущую переписку"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
