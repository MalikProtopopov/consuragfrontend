"use client";

import Link from "next/link";
import { FolderKanban, Bot, Users, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { Project } from "@/shared/types/api";

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  active: { label: "Активен", variant: "success" as const },
  inactive: { label: "Неактивен", variant: "secondary" as const },
  archived: { label: "Архивирован", variant: "outline" as const },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.inactive;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-all hover:border-accent-primary/50 hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-[150px]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10">
                <FolderKanban className="size-5 text-accent-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-text-primary line-clamp-1">{project.name}</h3>
                <p className="text-xs text-text-muted line-clamp-1">{project.slug}</p>
              </div>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
            <div className="flex items-center gap-1.5">
              <Bot className="size-4" />
              <span>{project.avatars_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>{project.members_count}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCircle className="size-4" />
              <span>{project.end_users_count ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

