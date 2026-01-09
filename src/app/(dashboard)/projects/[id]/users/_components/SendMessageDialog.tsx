"use client";

import { useState } from "react";
import { useSendMessageToEndUser } from "@/entities/end-user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
import type { IdentityProvider, UserIdentity } from "@/shared/types/api";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  endUserId: string;
  userName: string;
  identities: UserIdentity[];
  onSuccess?: () => void;
}

function getProviderLabel(provider: IdentityProvider): string {
  switch (provider) {
    case "telegram":
      return "Telegram";
    case "web":
      return "Web";
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Email";
    case "api":
      return "API";
    default:
      return provider;
  }
}

export function SendMessageDialog({
  open,
  onOpenChange,
  projectId,
  endUserId,
  userName,
  identities,
  onSuccess,
}: SendMessageDialogProps) {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<IdentityProvider>("telegram");
  const { mutate: sendMessage, isPending } = useSendMessageToEndUser();

  // Filter reachable identities
  const reachableIdentities = identities.filter((i) => i.is_reachable);

  // Set default channel from available identities
  const defaultChannel = reachableIdentities[0]?.provider || "telegram";

  const handleSend = () => {
    if (!text.trim()) {
      toast.error("Введите текст сообщения");
      return;
    }

    sendMessage(
      {
        projectId,
        endUserId,
        data: {
          channel: channel || defaultChannel,
          text: text.trim(),
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Сообщение отправлено");
            setText("");
            onOpenChange(false);
            onSuccess?.();
          } else {
            toast.error(response.error || "Не удалось отправить сообщение");
          }
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setText("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Отправить сообщение</DialogTitle>
          <DialogDescription>
            Сообщение будет отправлено пользователю <strong>{userName}</strong> от имени бота
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {reachableIdentities.length > 1 && (
            <div>
              <Label htmlFor="channel">Канал</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as IdentityProvider)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reachableIdentities.map((identity) => (
                    <SelectItem key={identity.id} value={identity.provider}>
                      {getProviderLabel(identity.provider)}
                      {identity.username && ` (@${identity.username})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="message-text">Текст сообщения</Label>
            <Textarea
              id="message-text"
              placeholder="Введите текст сообщения..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          {reachableIdentities.length === 0 && (
            <p className="text-sm text-destructive">
              У пользователя нет доступных каналов для отправки сообщений
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Отмена
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || !text.trim() || reachableIdentities.length === 0}
          >
            {isPending ? "Отправка..." : "Отправить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

