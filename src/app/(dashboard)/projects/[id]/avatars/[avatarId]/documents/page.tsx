"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAvatar } from "@/entities/avatar";
import { useDocuments, useUploadDocument } from "@/entities/document";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { SearchInput } from "@/shared/ui/search-input";
import { Skeleton } from "@/shared/ui/skeleton";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { toast } from "sonner";
import { getApiErrorMessage, usePagination } from "@/shared/lib";
import { DocumentRow, DocumentUploadDialog } from "./_components";

interface DocumentsPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading: avatarLoading } = useAvatar(projectId, avatarId);
  // Серверная пагинация (limit/offset) — список грузится постранично.
  const pagination = usePagination();
  const { data: documentsData, isLoading: documentsLoading } = useDocuments(projectId, avatarId, {
    skip: pagination.skip,
    limit: pagination.limit,
  });
  const { mutateAsync: uploadDocumentAsync } = useUploadDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");

  const isLoading = avatarLoading || documentsLoading;
  const documents = documentsData?.items || [];
  const q = query.trim().toLowerCase();
  const visibleDocs = q
    ? documents.filter((d) => d.original_filename?.toLowerCase().includes(q))
    : documents;
  // A-02: есть готовый (проиндексированный) документ → можно тестировать в чате.
  const hasIndexedDoc = documents.some((doc) => doc.parsing_status === "indexed");

  const handleUpload = async (files: File[]) => {
    setUploadDialogOpen(false);
    if (files.length === 0) return;

    // Грузим с ограниченной параллельностью (а не все разом), чтобы не упереться
    // в лимит соединений/нагрузку при пачке файлов. Один сводный тост вместо N.
    setUploading(true);
    const toastId = toast.loading(`Загрузка файлов: 0/${files.length}…`);
    const queue = [...files];
    let done = 0;
    let ok = 0;
    let firstError = "";
    const failed: string[] = [];
    const CONCURRENCY = 4;

    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          await uploadDocumentAsync({ projectId, avatarId, file });
          ok += 1;
        } catch (error) {
          failed.push(file.name);
          if (!firstError) firstError = getApiErrorMessage(error);
        } finally {
          done += 1;
          toast.loading(`Загрузка файлов: ${done}/${files.length}…`, { id: toastId });
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker)
    );

    setUploading(false);
    if (failed.length === 0) {
      toast.success(`Загружено файлов: ${ok}`, { id: toastId });
    } else {
      toast.error(
        `Загружено ${ok}, не удалось ${failed.length}${firstError ? `: ${firstError}` : ""}`,
        { id: toastId }
      );
    }
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
          <DocumentUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            uploading={uploading}
            onUpload={handleUpload}
          />
        }
      />

      {hasIndexedDoc && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
            <span>База знаний готова — аватар может отвечать по документам.</span>
          </div>
          <Button asChild size="sm">
            <Link href={`/projects/${projectId}/avatars/${avatarId}/chat`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Открыть тестовый чат
            </Link>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Документы ({documentsData?.total ?? documents.length})</CardTitle>
          <CardDescription>
            Поддерживаемые форматы: PDF, DOC, DOCX, TXT, MD, HTML, CSV, XLSX
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
            <>
              {documents.length > 5 && (
                <div className="mb-4 max-w-xs">
                  <SearchInput value={query} onChange={setQuery} placeholder="Поиск документов…" />
                </div>
              )}
              {visibleDocs.length === 0 ? (
                <p className="py-8 text-center text-text-muted">Ничего не найдено</p>
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
                    {visibleDocs.map((doc) => (
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
              <div className="mt-4">
                <PaginationControls pagination={pagination} total={documentsData?.total} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
