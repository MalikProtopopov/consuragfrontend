"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useDeleteProject } from "@/entities/project";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { notifyApiError } from "@/shared/lib";
import type { Project } from "@/shared/types/api";

/**
 * P-02 — удаление проекта. Необратимое действие защищено вводом названия проекта.
 */
export function DangerZone({ project }: { project: Project }) {
  const { mutate: deleteProject, isPending } = useDeleteProject();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const canDelete = confirmName.trim() === project.name;

  const handleDelete = () => {
    if (!canDelete || isPending) return;
    deleteProject(project.id, {
      onSuccess: () => toast.success("Проект удалён"),
      onError: notifyApiError,
    });
  };

  return (
    <Card className="border-error/30">
      <CardHeader>
        <CardTitle className="text-error">Опасная зона</CardTitle>
        <CardDescription>
          Удаление проекта необратимо — будут удалены все аватары, документы и диалоги.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setConfirmName("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить проект
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить проект «{project.name}»?</DialogTitle>
              <DialogDescription>
                Действие необратимо. Введите название проекта{" "}
                <span className="font-medium text-text-primary">{project.name}</span>, чтобы
                подтвердить.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="confirm-project-name">Название проекта</Label>
              <Input
                id="confirm-project-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={project.name}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={!canDelete || isPending}>
                {isPending ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Удалить навсегда
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
