import { FileText } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useDocumentChunks } from "@/entities/document";
import { getApiErrorMessage } from "@/shared/lib";

export function ChunksView({
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
        <p className="text-sm text-text-muted">{getApiErrorMessage(error)}</p>
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
        <div className="text-sm text-text-muted mb-2">Всего чанков: {chunks.length}</div>
        {chunks.map((chunk) => (
          <div key={chunk.id} className="p-4 rounded-lg border border-border w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <Badge variant="outline" className="flex-shrink-0">
                  Чанк {chunk.chunk_index + 1}
                </Badge>
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
              <span className="text-xs text-text-muted flex-shrink-0">
                {chunk.token_count} токенов
              </span>
            </div>
            <div className="w-full min-w-0">
              <p
                className="text-sm text-text-secondary whitespace-pre-wrap break-words"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {chunk.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
