"use client";

import { use, useState } from "react";
import { Plus, Trash2, Settings as SettingsIcon } from "lucide-react";
import {
  useProject,
  useProjectMembers,
  useAddMember,
  useUpdateMember,
  useRemoveMember,
} from "@/entities/project";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { ProjectMember, UserRole } from "@/shared/types/api";

interface ProjectMembersPageProps {
  params: Promise<{ id: string }>;
}

const roleLabels: Record<UserRole, string> = {
  saas_admin: "Администратор",
  owner: "Владелец",
  manager: "Менеджер",
  content_manager: "Контент-менеджер",
  client: "Клиент",
};

export default function ProjectMembersPage({ params }: ProjectMembersPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: membersData, isLoading: membersLoading, error: membersError } = useProjectMembers(projectId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);

  const isLoading = projectLoading || membersLoading;
  // API returns array directly
  const members = membersData || [];

  // Handle permission error
  if (membersError && isPermissionError(membersError)) {
    return (
      <PageContainer>
        <PageHeader title="Участники проекта" description={project?.name || ""} />
        <AccessDenied
          message="У вас нет прав для просмотра участников этого проекта. Обратитесь к администратору для получения доступа."
          backHref={`/projects/${projectId}`}
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Проект не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Участники проекта"
        description={project.name}
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить участника
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить участника</DialogTitle>
              </DialogHeader>
              <AddMemberForm
                projectId={projectId}
                onSuccess={() => setAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Участники ({members.length})</CardTitle>
          <CardDescription>Управление доступом к проекту</CardDescription>
        </CardHeader>
        <CardContent>
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
                        <p className="font-medium text-text-primary">
                          {member.user_name || "—"}
                        </p>
                        <p className="text-sm text-text-muted">{member.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[member.role]}</Badge>
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
                          onOpenChange={(open) => setEditingMember(open ? member : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                              onSuccess={() => setEditingMember(null)}
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
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// Add Member Form
function AddMemberForm({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess: () => void;
}) {
  const { mutate: addMember, isPending } = useAddMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [permissions, setPermissions] = useState({
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

// Edit Member Form
function EditMemberForm({
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
  const [permissions, setPermissions] = useState({
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

// Permission Checkboxes
function PermissionCheckboxes({
  permissions,
  onChange,
}: {
  permissions: {
    can_manage_avatars: boolean;
    can_manage_documents: boolean;
    can_manage_members: boolean;
    can_view_analytics: boolean;
    can_manage_settings: boolean;
  };
  onChange: (p: typeof permissions) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="avatars"
          checked={permissions.can_manage_avatars}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_avatars: !!c })}
        />
        <Label htmlFor="avatars" className="font-normal">
          Управление аватарами
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="documents"
          checked={permissions.can_manage_documents}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_documents: !!c })}
        />
        <Label htmlFor="documents" className="font-normal">
          Управление документами
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="members"
          checked={permissions.can_manage_members}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_members: !!c })}
        />
        <Label htmlFor="members" className="font-normal">
          Управление участниками
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="analytics"
          checked={permissions.can_view_analytics}
          onCheckedChange={(c) => onChange({ ...permissions, can_view_analytics: !!c })}
        />
        <Label htmlFor="analytics" className="font-normal">
          Просмотр аналитики
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="settings"
          checked={permissions.can_manage_settings}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_settings: !!c })}
        />
        <Label htmlFor="settings" className="font-normal">
          Управление настройками
        </Label>
      </div>
    </div>
  );
}

// Remove Member Button
function RemoveMemberButton({ projectId, userId }: { projectId: string; userId: string }) {
  const { mutate: removeMember, isPending } = useRemoveMember();

  const handleRemove = () => {
    if (confirm("Удалить участника из проекта?")) {
      removeMember(
        { projectId, userId },
        {
          onSuccess: () => toast.success("Участник удален"),
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isPending}>
      {isPending ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-error" />}
    </Button>
  );
}

