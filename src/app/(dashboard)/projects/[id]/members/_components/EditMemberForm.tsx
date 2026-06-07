"use client";

import { useState } from "react";
import { useUpdateMember } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { ProjectMember, UserRole } from "@/shared/types/api";
import { PermissionCheckboxes, type MemberPermissions } from "./PermissionCheckboxes";

export function EditMemberForm({
  projectId,
  member,
  onSuccess,
}: {
  projectId: string;
  member: ProjectMember;
  onSuccess: () => void;
}) {
  const { mutate: updateMember, isPending } = useUpdateMember();
  const [role, setRole] = useState<UserRole>(member.role);
  const [permissions, setPermissions] = useState<MemberPermissions>({
    can_manage_avatars: member.can_manage_avatars,
    can_manage_documents: member.can_manage_documents,
    can_manage_members: member.can_manage_members,
    can_view_analytics: member.can_view_analytics,
    can_manage_settings: member.can_manage_settings,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(
      { projectId, userId: member.user_id, data: { role, ...permissions } },
      {
        onSuccess: () => {
          toast.success("Участник обновлен");
          onSuccess();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Роль</Label>
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Менеджер</SelectItem>
            <SelectItem value="content_manager">Контент-менеджер</SelectItem>
            <SelectItem value="client">Клиент</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>Разрешения</Label>
        <PermissionCheckboxes permissions={permissions} onChange={setPermissions} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner className="mr-2 h-4 w-4" />}
        Сохранить
      </Button>
    </form>
  );
}
