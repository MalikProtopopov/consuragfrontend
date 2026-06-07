"use client";

import { useState } from "react";
import { useAddMember } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { UserRole } from "@/shared/types/api";
import { PermissionCheckboxes, type MemberPermissions } from "./PermissionCheckboxes";

export function AddMemberForm({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess: () => void;
}) {
  const { mutate: addMember, isPending } = useAddMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [permissions, setPermissions] = useState<MemberPermissions>({
    can_manage_avatars: true,
    can_manage_documents: true,
    can_manage_members: false,
    can_view_analytics: true,
    can_manage_settings: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMember(
      { projectId, data: { email, role, ...permissions } },
      {
        onSuccess: () => {
          toast.success("Участник добавлен");
          onSuccess();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />
      </div>
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
        Добавить
      </Button>
    </form>
  );
}
