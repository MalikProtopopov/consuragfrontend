"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { useAvatar, usePublishAvatar } from "@/entities/avatar";
import { useChat } from "@/entities/chat";
import { useAuthStore } from "@/entities/auth";
import { notifyApiError } from "@/shared/lib";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { AIInput } from "@/shared/ui/ai-input";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { ChatHeader, ChatMessages } from "./_components";

interface ChatPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading: avatarLoading } = useAvatar(projectId, avatarId);
  const { mutate: publishAvatar, isPending: isPublishing } = usePublishAvatar();
  const { user } = useAuthStore();

  const handlePublish = () => {
    publishAvatar(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар опубликован — можно тестировать"),
        onError: notifyApiError,
      },
    );
  };
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // L-03: тестовый чат требует опубликованного аватара — вместо пустого/битого
  // чата показываем понятное состояние с действием «Опубликовать».
  if (!avatar.is_published) {
    return (
      <PageContainer maxWidth="lg">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/projects/${projectId}/avatars/${avatarId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К аватару
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Send}
          title="avatar_not_published"
          description="Чтобы протестировать аватара в чате, опубликуйте его. Убедитесь, что загружены документы — аватар отвечает по ним."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Spinner className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                Опубликовать аватара
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/projects/${projectId}/avatars/${avatarId}/documents`}>Документы</Link>
              </Button>
            </div>
          }
        />
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
        <ChatHeader avatar={avatar} sessionId={sessionId} />

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ChatMessages
            avatar={avatar}
            messages={messages}
            isInitializing={isInitializing}
            isTyping={chatLoading || isSending}
            userAvatarUrl={user?.avatar_url}
            scrollRef={scrollRef}
            onFeedback={(messageId, feedback) => sendFeedback({ messageId, feedback })}
          />

          {/* Input */}
          <div className="p-4 border-t border-border">
            <AIInput
              ref={inputRef}
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              isSending={isSending}
              disabled={isInitializing}
            />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
