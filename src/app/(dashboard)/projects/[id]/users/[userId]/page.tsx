"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useEndUser,
  useUnblockEndUser,
  useEndUserConversations,
} from "@/entities/end-user";
import { BlockUserDialog, SendMessageDialog } from "../_components";
import {
  UserHeader,
  UserIdentitiesCard,
  UserStatsCard,
  UserTagsCard,
  UserLimitsCard,
  UserNotesCard,
  UserRecentConversations,
} from "./_components";
import { PageContainer } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

interface EndUserDetailPageProps {
  params: Promise<{ id: string; userId: string }>;
}

export default function EndUserDetailPage({ params }: EndUserDetailPageProps) {
  const { id: projectId, userId: endUserId } = use(params);

  const { data: user, isLoading, isError } = useEndUser(projectId, endUserId);
  const { data: conversationsData } = useEndUserConversations(projectId, endUserId, {
    limit: 5,
  });
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockEndUser();

  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);

  const conversations = conversationsData?.items || [];

  const handleUnblock = () => {
    unblockUser(
      { projectId, endUserId },
      {
        onSuccess: () => toast.success("Пользователь разблокирован"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[200px] mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !user) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.END_USERS(projectId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К списку пользователей
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-text-secondary">Пользователь не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.END_USERS(projectId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К списку пользователей
          </Link>
        </Button>
      </div>

      <UserHeader
        user={user}
        onSendMessage={() => setIsSendMessageDialogOpen(true)}
        onBlock={() => setIsBlockDialogOpen(true)}
        onUnblock={handleUnblock}
        isUnblocking={isUnblocking}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <UserIdentitiesCard identities={user.identities} />
          <UserStatsCard user={user} />
          <UserTagsCard
            key={`tags-${user.id}`}
            projectId={projectId}
            endUserId={endUserId}
            initialTags={user.tags || []}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <UserLimitsCard
            key={`limits-${user.id}`}
            projectId={projectId}
            endUserId={endUserId}
            limits={user.limits}
          />
          <UserNotesCard
            key={`notes-${user.id}`}
            projectId={projectId}
            endUserId={endUserId}
            initialNotes={user.notes || ""}
          />
          <UserRecentConversations
            projectId={projectId}
            endUserId={endUserId}
            conversations={conversations}
          />
        </div>
      </div>

      <BlockUserDialog
        open={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        projectId={projectId}
        endUserId={endUserId}
        userName={user.display_name || "Пользователь"}
      />

      <SendMessageDialog
        open={isSendMessageDialogOpen}
        onOpenChange={setIsSendMessageDialogOpen}
        projectId={projectId}
        endUserId={endUserId}
        userName={user.display_name || "Пользователь"}
        identities={user.identities}
      />
    </PageContainer>
  );
}
