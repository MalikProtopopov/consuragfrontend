"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useConversation,
  useConversationMessages,
  useEndConversation,
  useSendMessageToEndUser,
  useEndUser,
} from "@/entities/end-user";
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

  const { data: conversation, isLoading: convLoading } = useConversation(projectId, conversationId);
  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(
    projectId,
    conversationId,
    { limit: 200 }
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
    if (!messageText.trim()) return;

    sendMessage(
      {
        projectId,
        endUserId,
        data: {
          channel: conversation?.channel || "telegram",
          text: messageText.trim(),
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Сообщение отправлено");
            setMessageText("");
          } else {
            toast.error(response.error || "Не удалось отправить сообщение");
          }
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
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
        canSend={conversation.status === "active" && user?.status === "active"}
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
