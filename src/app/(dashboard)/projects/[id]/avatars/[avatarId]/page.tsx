"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, X, FileText, ArrowRight } from "lucide-react";
import {
  useAvatar,
  useAvatarStats,
  useUpdateAvatar,
  useDeleteAvatar,
  usePublishAvatar,
  useUnpublishAvatar,
} from "@/entities/avatar";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { AvatarStatusBadge } from "@/shared/ui/status-badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { AvatarIdentity } from "@/shared/ui/avatar-identity";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { DEFAULT_AVATAR_COLOR } from "@/shared/config";
import type { UpdateAvatarRequest } from "@/shared/types/api";
import { AvatarSettingsTabs, DeleteAvatarDialog } from "./_components";

interface AvatarSettingsPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

export default function AvatarSettingsPage({ params }: AvatarSettingsPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading } = useAvatar(projectId, avatarId);
  const { data: stats } = useAvatarStats(projectId, avatarId);
  const { mutate: updateAvatar, isPending: updating } = useUpdateAvatar();
  const { mutate: deleteAvatar, isPending: deleting } = useDeleteAvatar();
  const { mutate: publish, isPending: publishing } = usePublishAvatar();
  const { mutate: unpublish, isPending: unpublishing } = useUnpublishAvatar();

  const [form, setForm] = useState<UpdateAvatarRequest>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize the form from the loaded avatar without an effect:
  // adjust state during render when the loaded avatar changes.
  const [initializedAvatarId, setInitializedAvatarId] = useState<string | null>(null);
  if (avatar && avatar.id !== initializedAvatarId) {
    setInitializedAvatarId(avatar.id);
    setForm({
      name: avatar.name,
      description: avatar.description || "",
      status: avatar.status,
      system_prompt: avatar.system_prompt || "",
      welcome_message: avatar.welcome_message || "",
      fallback_message: avatar.fallback_message || "",
      avatar_image_url: avatar.avatar_image_url || "",
      primary_color: avatar.primary_color || DEFAULT_AVATAR_COLOR,
      llm_model: avatar.llm_model || "",
      llm_temperature: avatar.llm_temperature || 0.7,
      rag_top_k: avatar.rag_top_k || 5,
    });
  }

  const handleSave = (data: Partial<UpdateAvatarRequest>) => {
    updateAvatar(
      { projectId, avatarId, data },
      {
        onSuccess: () => toast.success("Настройки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handlePublish = () => {
    publish(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар опубликован"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleUnpublish = () => {
    unpublish(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар снят с публикации"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleDelete = () => {
    deleteAvatar(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар удален"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[500px]" />
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
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}/avatars`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К аватарам
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-start gap-4">
        <AvatarIdentity
          name={avatar.name}
          color={avatar.primary_color}
          imageUrl={avatar.avatar_image_url}
          size="lg"
        />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <AvatarStatusBadge status={avatar.status} />
          {avatar.is_published && <Badge variant="success-subtle">Опубликован</Badge>}
        </div>
      </div>

      <PageHeader
        title={avatar.name}
        description={avatar.description || "Настройки аватара"}
        actions={
          <div className="flex gap-2">
            {avatar.is_published ? (
              <Button variant="outline" onClick={handleUnpublish} disabled={unpublishing}>
                {unpublishing ? <Spinner className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                Снять с публикации
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? <Spinner className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                Опубликовать
              </Button>
            )}
            <DeleteAvatarDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </div>
        }
      />

      {/* A-03: next-step — без документов аватар не сможет отвечать */}
      {avatar.documents_count === 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-ring/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <FileText className="size-5 shrink-0 text-primary-link" aria-hidden />
            <span>Загрузите документы — аватар отвечает по вашей базе знаний.</span>
          </div>
          <Button asChild size="sm">
            <Link href={`/projects/${projectId}/avatars/${avatarId}/documents`}>
              Загрузить документы
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <AvatarSettingsTabs
        form={form}
        setForm={setForm}
        onSave={handleSave}
        updating={updating}
        stats={stats}
      />
    </PageContainer>
  );
}
