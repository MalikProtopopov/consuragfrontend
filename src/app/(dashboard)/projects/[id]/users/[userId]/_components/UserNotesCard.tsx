"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useUpdateEndUser } from "@/entities/end-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { getApiErrorMessage } from "@/shared/lib";
import { toast } from "sonner";

interface UserNotesCardProps {
  projectId: string;
  endUserId: string;
  initialNotes: string;
}

export function UserNotesCard({ projectId, endUserId, initialNotes }: UserNotesCardProps) {
  const { mutate: updateUser, isPending: isUpdating } = useUpdateEndUser();

  const [notes, setNotes] = useState(initialNotes);
  const isModified = notes !== initialNotes;

  const handleSaveNotes = () => {
    updateUser(
      { projectId, endUserId, data: { notes } },
      {
        onSuccess: () => toast.success("Заметки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Заметки</CardTitle>
            <CardDescription>Приватные заметки администратора</CardDescription>
          </div>
          {isModified && (
            <Button size="sm" onClick={handleSaveNotes} disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Добавьте заметки о пользователе..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
