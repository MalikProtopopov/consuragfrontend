"use client";

import { use, useState } from "react";
import { Plus, Users } from "lucide-react";
import { useProject, useProjectMembers } from "@/entities/project";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import type { ProjectMember } from "@/shared/types/api";
import { AddMemberForm, MembersTable } from "./_components";

interface ProjectMembersPageProps {
  params: Promise<{ id: string }>;
}

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
              <AddMemberForm projectId={projectId} onSuccess={() => setAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="no_members_yet"
          description="В проекте пока только вы. Пригласите коллег, чтобы работать над аватарами вместе."
          action={
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Пригласить участника
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Участники ({members.length})</CardTitle>
            <CardDescription>Управление доступом к проекту</CardDescription>
          </CardHeader>
          <CardContent>
            <MembersTable
              projectId={projectId}
              members={members}
              editingMember={editingMember}
              onEditingChange={setEditingMember}
            />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
