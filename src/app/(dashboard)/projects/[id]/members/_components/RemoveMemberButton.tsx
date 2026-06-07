"use client";

import { Trash2 } from "lucide-react";
import { useRemoveMember } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

export function RemoveMemberButton({ projectId, userId }: { projectId: string; userId: string }) {
  const { mutate: removeMember, isPending } = useRemoveMember();
  const confirm = useConfirm();

  const handleRemove = async () => {
    const ok = await confirm({
      title: "Удалить участника?",
      description: "Участник потеряет доступ к проекту.",
      confirmLabel: "Удалить",
      variant: "destructive",
    });
    if (!ok) return;
    removeMember(
      { projectId, userId },
      {
        onSuccess: () => toast.success("Участник удален"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isPending}>
      {isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-error" />}
    </Button>
  );
}
