"use client";

import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { useUpdateEndUser } from "@/entities/end-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { getApiErrorMessage } from "@/shared/lib";
import { toast } from "sonner";

interface UserTagsCardProps {
  projectId: string;
  endUserId: string;
  initialTags: string[];
}

export function UserTagsCard({ projectId, endUserId, initialTags }: UserTagsCardProps) {
  const { mutate: updateUser, isPending: isUpdating } = useUpdateEndUser();

  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [isModified, setIsModified] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setIsModified(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsModified(true);
  };

  const handleSaveTags = () => {
    updateUser(
      { projectId, endUserId, data: { tags } },
      {
        onSuccess: () => {
          toast.success("Теги сохранены");
          setIsModified(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Теги</CardTitle>
            <CardDescription>Теги для сегментации пользователя</CardDescription>
          </div>
          {isModified && (
            <Button size="sm" onClick={handleSaveTags} disabled={isUpdating}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="pr-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 p-0.5 hover:bg-bg-hover rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {tags.length === 0 && <p className="text-sm text-text-muted">Нет тегов</p>}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Новый тег..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
