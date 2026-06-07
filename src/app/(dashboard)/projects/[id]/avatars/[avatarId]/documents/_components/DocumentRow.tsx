import { useState } from "react";
import { Trash2, RefreshCw, Eye, File } from "lucide-react";
import {
  useDeleteDocument,
  useReindexDocument,
} from "@/entities/document";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { TableCell, TableRow } from "@/shared/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";
import { getApiErrorMessage, formatBytes } from "@/shared/lib";
import type { Document, DocumentStatus } from "@/shared/types/api";
import { ChunksView } from "./ChunksView";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }
> = {
  pending: { label: "Ожидание", variant: "secondary" },
  uploading: { label: "Загрузка", variant: "default" },
  parsing: { label: "Парсинг", variant: "default" },
  chunking: { label: "Разбиение", variant: "default" },
  embedding: { label: "Эмбеддинг", variant: "default" },
  indexed: { label: "Готов", variant: "success" },
  failed: { label: "Ошибка", variant: "destructive" },
};

export function DocumentRow({
  document: doc,
  projectId,
  avatarId,
}: {
  document: Document;
  projectId: string;
  avatarId: string;
}) {
  const { mutate: deleteDocument, isPending: deleting } = useDeleteDocument();
  const { mutate: reindexDocument, isPending: reindexing } = useReindexDocument();
  const confirm = useConfirm();
  const [chunksDialogOpen, setChunksDialogOpen] = useState(false);

  const status = statusConfig[doc.parsing_status] || {
    label: "Неизвестно",
    variant: "outline" as const,
  };
  const isProcessing = ["pending", "uploading", "parsing", "chunking", "embedding"].includes(
    doc.parsing_status
  );

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Удалить документ?",
      description: "Документ и его данные будут удалены из базы знаний.",
      confirmLabel: "Удалить",
      variant: "destructive",
    });
    if (!ok) return;
    deleteDocument(
      { projectId, avatarId, documentId: doc.id },
      {
        onSuccess: () => toast.success("Документ удален"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleReindex = () => {
    reindexDocument(
      { projectId, avatarId, documentId: doc.id },
      {
        onSuccess: () => toast.success("Переиндексация запущена"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <File className="h-5 w-5 text-text-muted" />
          <div>
            <p className="font-medium text-text-primary truncate max-w-[200px]">
              {doc.original_filename}
            </p>
            {doc.error_message && (
              <p className="text-xs text-error truncate max-w-[200px]">{doc.error_message}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{formatBytes(doc.file_size)}</TableCell>
      <TableCell>{doc.chunks_count}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <Badge variant={status.variant}>{status.label}</Badge>
          {isProcessing && doc.processing_progress > 0 && (
            <Progress value={doc.processing_progress} className="h-1 w-20" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {doc.parsing_status === "indexed" && (
            <Dialog open={chunksDialogOpen} onOpenChange={setChunksDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Просмотреть чанки">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Чанки: {doc.original_filename}</DialogTitle>
                </DialogHeader>
                <ChunksView projectId={projectId} avatarId={avatarId} documentId={doc.id} />
              </DialogContent>
            </Dialog>
          )}
          {doc.parsing_status === "failed" && (
            <Button variant="ghost" size="icon" onClick={handleReindex} disabled={reindexing} aria-label="Переиндексировать документ">
              {reindexing ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting} aria-label="Удалить документ">
            {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-error" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
