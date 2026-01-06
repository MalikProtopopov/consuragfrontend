"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Upload, X, File, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "./button";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      setFiles(acceptedFiles);
    },
    []
  );

  const onDropRejected = useCallback(
    (rejectedFiles: { file: File; errors: readonly { message: string; code: string }[] }[]) => {
      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0]?.errors?.[0];
        if (firstError?.message?.includes("too large")) {
          setError(`Файл слишком большой. Максимум ${formatFileSize(maxSize)}`);
        } else if (firstError?.message?.includes("type")) {
          setError("Неподдерживаемый формат файла");
        } else {
          setError(firstError?.message || "Ошибка загрузки файла");
        }
      }
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files);
      setFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-accent-primary bg-accent-primary/5"
            : "border-border hover:border-accent-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-text-muted mb-4" />
        {isDragActive ? (
          <p className="text-text-primary">Отпустите файлы здесь...</p>
        ) : (
          <>
            <p className="text-text-primary mb-1">
              Перетащите файлы или{" "}
              <span className="text-accent-primary">выберите</span>
            </p>
            <p className="text-xs text-text-muted">
              Максимум {formatFileSize(maxSize)}
              {maxFiles > 1 && `, до ${maxFiles} файлов`}
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-secondary"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <File className="h-5 w-5 text-text-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary break-all">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleUpload} className="w-full" disabled={disabled}>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить {files.length > 1 ? `(${files.length})` : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
