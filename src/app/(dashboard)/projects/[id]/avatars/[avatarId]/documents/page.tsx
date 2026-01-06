"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, RefreshCw, Eye, FileText, File } from "lucide-react";
import { useAvatar } from "@/entities/avatar";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  useReindexDocument,
  useDocumentChunks,
} from "@/entities/document";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { FileUpload } from "@/shared/ui/file-upload";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { Document, DocumentStatus } from "@/shared/types/api";

interface DocumentsPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

const statusConfig: Record<DocumentStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  pending: { label: "Ожидание", variant: "secondary" },
  uploading: { label: "Загрузка", variant: "default" },
  parsing: { label: "Парсинг", variant: "default" },
  chunking: { label: "Разбиение", variant: "default" },
  embedding: { label: "Эмбеддинг", variant: "default" },
  indexed: { label: "Готов", variant: "success" },
  failed: { label: "Ошибка", variant: "destructive" },
};

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading: avatarLoading } = useAvatar(projectId, avatarId);
  const { data: documentsData, isLoading: documentsLoading } = useDocuments(projectId, avatarId);
  const { mutate: uploadDocument, isPending: uploading } = useUploadDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const isLoading = avatarLoading || documentsLoading;
  const documents = documentsData?.items || [];

  const handleUpload = (files: File[]) => {
    files.forEach((file) => {
      uploadDocument(
        { projectId, avatarId, file },
        {
          onSuccess: () => {
            toast.success(`${file.name} загружен`);
          },
          onError: (error) => {
            toast.error(`Ошибка загрузки ${file.name}: ${getApiErrorMessage(error)}`);
          },
        }
      );
    });
    setUploadDialogOpen(false);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!avatar) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Аватар не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}/avatars/${avatarId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К аватару
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Документы"
        description={`База знаний для ${avatar.name}`}
        actions={
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Загрузка документов</DialogTitle>
              </DialogHeader>
              <FileUpload
                onUpload={handleUpload}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                  "text/plain": [".txt"],
                  "text/markdown": [".md"],
                  "text/html": [".html"],
                }}
                maxSize={50 * 1024 * 1024}
                maxFiles={10}
                disabled={uploading}
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Spinner className="h-4 w-4" />
                  Загрузка...
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Документы ({documents.length})</CardTitle>
          <CardDescription>
            Поддерживаемые форматы: PDF, DOCX, TXT, MD, HTML
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary mb-4">Нет загруженных документов</p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Загрузить первый документ
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Документ</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Чанков</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    document={doc}
                    projectId={projectId}
                    avatarId={avatarId}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function DocumentRow({
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
  const [chunksDialogOpen, setChunksDialogOpen] = useState(false);

  const status = statusConfig[doc.parsing_status] || { label: "Неизвестно", variant: "outline" as const };
  const isProcessing = ["pending", "uploading", "parsing", "chunking", "embedding"].includes(
    doc.parsing_status
  );

  const handleDelete = () => {
    if (confirm("Удалить документ?")) {
      deleteDocument(
        { projectId, avatarId, documentId: doc.id },
        {
          onSuccess: () => toast.success("Документ удален"),
          onError: (error) => toast.error(getApiErrorMessage(error)),
        }
      );
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
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
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Чанки: {doc.original_filename}</DialogTitle>
                </DialogHeader>
                <ChunksView
                  projectId={projectId}
                  avatarId={avatarId}
                  documentId={doc.id}
                />
              </DialogContent>
            </Dialog>
          )}
          {doc.parsing_status === "failed" && (
            <Button variant="ghost" size="icon" onClick={handleReindex} disabled={reindexing}>
              {reindexing ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4 text-error" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ChunksView({
  projectId,
  avatarId,
  documentId,
}: {
  projectId: string;
  avatarId: string;
  documentId: string;
}) {
  const { data, isLoading, isError, error } = useDocumentChunks(projectId, avatarId, documentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-error mb-2">Ошибка загрузки чанков</div>
        <p className="text-sm text-text-muted">
          {getApiErrorMessage(error)}
        </p>
      </div>
    );
  }

  // API возвращает массив напрямую
  const chunks = data || [];

  if (chunks.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-10 w-10 text-text-muted mb-3" />
        <p className="text-text-secondary">Нет чанков для отображения</p>
        <p className="text-sm text-text-muted mt-1">Документ ещё не был обработан</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        <div className="text-sm text-text-muted mb-2">
          Всего чанков: {chunks.length}
        </div>
        {chunks.map((chunk) => (
          <div key={chunk.id} className="p-4 rounded-lg border border-border w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Badge variant="outline" className="flex-shrink-0">Чанк {chunk.chunk_index + 1}</Badge>
                {chunk.page_number && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    Стр. {chunk.page_number}
                  </Badge>
                )}
                {chunk.section_title && (
                  <span className="text-xs text-text-muted truncate max-w-full sm:max-w-[200px] min-w-0">
                    {chunk.section_title}
                  </span>
                )}
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">{chunk.token_count} токенов</span>
            </div>
            <div className="w-full min-w-0">
              <p className="text-sm text-text-secondary whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {chunk.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

