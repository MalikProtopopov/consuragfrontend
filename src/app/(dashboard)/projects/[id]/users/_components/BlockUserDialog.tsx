"use client";

import { useState } from "react";
import { useBlockEndUser } from "@/entities/end-user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  endUserId: string;
  userName: string;
  onSuccess?: () => void;
}

export function BlockUserDialog({
  open,
  onOpenChange,
  projectId,
  endUserId,
  userName,
  onSuccess,
}: BlockUserDialogProps) {
  const [reason, setReason] = useState("");
  const { mutate: blockUser, isPending } = useBlockEndUser();

  const handleBlock = () => {
    blockUser(
      { projectId, endUserId, data: { reason: reason || undefined } },
      {
        onSuccess: () => {
          toast.success("Пользователь заблокирован");
          setReason("");
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setReason("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заблокировать пользователя?</DialogTitle>
          <DialogDescription>
            <strong>{userName}</strong> не сможет отправлять сообщения боту до разблокировки.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="block-reason">Причина блокировки (опционально)</Label>
          <Input
            id="block-reason"
            placeholder="Спам, нецензурная лексика..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleBlock} disabled={isPending}>
            {isPending ? "Блокировка..." : "Заблокировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

