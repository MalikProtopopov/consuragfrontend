"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import type { ProjectMember } from "@/shared/types/api";
import { EditMemberForm } from "./EditMemberForm";
import { RemoveMemberButton } from "./RemoveMemberButton";
import { PROJECT_ROLE_LABELS } from "./roles";

export function MembersTable({
  projectId,
  members,
  editingMember,
  onEditingChange,
}: {
  projectId: string;
  members: ProjectMember[];
  editingMember: ProjectMember | null;
  onEditingChange: (member: ProjectMember | null) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Участник</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead>Разрешения</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.user_id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent-primary/10 text-accent-primary text-xs">
                    {(member.user_name || member.user_email)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-text-primary">{member.user_name || "—"}</p>
                  <p className="text-sm text-text-muted">{member.user_email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{PROJECT_ROLE_LABELS[member.role]}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {member.can_manage_avatars && <Badge variant="secondary">Аватары</Badge>}
                {member.can_manage_documents && <Badge variant="secondary">Документы</Badge>}
                {member.can_manage_members && <Badge variant="secondary">Участники</Badge>}
                {member.can_view_analytics && <Badge variant="secondary">Аналитика</Badge>}
                {member.can_manage_settings && <Badge variant="secondary">Настройки</Badge>}
              </div>
            </TableCell>
            <TableCell className="text-right">
              {member.role !== "owner" && (
                <div className="flex justify-end gap-2">
                  <Dialog
                    open={editingMember?.user_id === member.user_id}
                    onOpenChange={(open) => onEditingChange(open ? member : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Редактировать участника">
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать участника</DialogTitle>
                      </DialogHeader>
                      <EditMemberForm
                        projectId={projectId}
                        member={member}
                        onSuccess={() => onEditingChange(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <RemoveMemberButton projectId={projectId} userId={member.user_id} />
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
