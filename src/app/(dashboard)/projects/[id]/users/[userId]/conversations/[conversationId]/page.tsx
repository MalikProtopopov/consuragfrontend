"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useConversation,
  useConversationMessages,
  useEndConversation,
  useSendMessageToEndUser,
  useEndUser,
  endUserKeys,
} from "@/entities/end-user";
import type { ConversationMessage, ConversationMessagesResponse } from "@/shared/types/api";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { ConversationInfoCard, ConversationMessages } from "./_components";

interface ConversationDetailPageProps {
  params: Promise<{ id: string; userId: string; conversationId: string }>;
}

export default function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id: projectId, userId: endUserId, conversationId } = use(params);

  const queryClient = useQueryClient();
  const messagesParams = { limit: 200 };

  const { data: conversation, isLoading: convLoading } = useConversation(projectId, conversationId);
  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(
    projectId,
    conversationId,
    messagesParams
  );
  const { data: user } = useEndUser(projectId, endUserId);

  const { mutate: endConversation, isPending: isEnding } = useEndConversation();
  const { mutate: sendMessage, isPending: isSending } = useSendMessageToEndUser();

  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const messages = messagesData?.items || [];
  const isLoading = convLoading || messagesLoading;

  const handleEndConversation = () => {
    endConversation(
      { projectId, conversationId },
      {
        onSuccess: () => {
          toast.success("Диалог завершён");
          setIsEndDialogOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) return;

    // Optimistically show the operator's message immediately, then let the
    // mutation's invalidate refetch the authoritative thread (the backend now
    // keeps the message in this same conversation — see extend_session).
    const messagesKey = endUserKeys.messages(projectId, conversationId, messagesParams);
    const previous = queryClient.getQueryData<ConversationMessagesResponse>(messagesKey);
    const optimistic: ConversationMessage = {
      id: `optimistic-${Date.now()}`,
      direction: "out",
      role: "admin",
      content: text,
      content_type: "text",
      attachments: null,
      provider_message_id: null,
      model_used: null,
      total_tokens: 0,
      feedback: null,
      feedback_comment: null,
      created_at: new Date().toISOString(),
    };
    queryClient.setQueryData<ConversationMessagesResponse>(messagesKey, (old) =>
      old ? { ...old, items: [...old.items, optimistic], total: old.total + 1 } : old
    );
    setMessageText("");

    const revert = () => {
      if (previous) queryClient.setQueryData(messagesKey, previous);
      setMessageText(text);
    };

    sendMessage(
      {
        projectId,
        endUserId,
        data: {
          channel: conversation?.channel || "telegram",
          text,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Сообщение отправлено");
          } else {
            toast.error(response.error || "Не удалось отправить сообщение");
            revert();
          }
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
          revert();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[150px] mb-6" />
        <Skeleton className="h-[500px]" />
      </PageContainer>
    );
  }

  if (!conversation) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.END_USER_DETAIL(projectId, endUserId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К профилю пользователя
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-text-secondary">Диалог не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.END_USER_DETAIL(projectId, endUserId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К профилю пользователя
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Диалог с ${user?.display_name || "пользователем"}`}
        description={conversation.avatar_name || "AI Аватар"}
      />

      <ConversationInfoCard
        conversation={conversation}
        isEnding={isEnding}
        onEnd={() => setIsEndDialogOpen(true)}
      />

      <ConversationMessages
        conversation={conversation}
        messages={messages}
        canSend={user?.status === "active"}
        messageText={messageText}
        isSending={isSending}
        onMessageChange={setMessageText}
        onSend={handleSendMessage}
      />

      {/* End Conversation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить диалог?</DialogTitle>
            <DialogDescription>
              Диалог будет помечен как завершённый. Пользователь сможет начать новый диалог.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEndConversation} disabled={isEnding}>
              {isEnding ? "Завершение..." : "Завершить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
