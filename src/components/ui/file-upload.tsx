"use client"

import * as React from "react"
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"

export interface FileWithProgress {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  errorMessage?: string
}

const fileTypeIcons: Record<string, React.ElementType> = {
  "application/pdf": FileText,
  "image/": Image,
  default: File,
}

function getFileIcon(mimeType: string) {
  for (const [key, Icon] of Object.entries(fileTypeIcons)) {
    if (mimeType.startsWith(key)) return Icon
  }
  return fileTypeIcons.default
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  files?: FileWithProgress[]
  onFilesChange?: (files: FileWithProgress[]) => void
  onFileRemove?: (id: string) => void
  disabled?: boolean
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      accept,
      multiple = true,
      maxSize = 10 * 1024 * 1024, // 10MB default
      maxFiles = 10,
      files = [],
      onFilesChange,
      onFileRemove,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      handleFiles(selectedFiles)
      // Reset input
      if (inputRef.current) inputRef.current.value = ""
    }

    const handleFiles = (newFiles: File[]) => {
      const validFiles = newFiles
        .slice(0, maxFiles - files.length)
        .filter((file) => file.size <= maxSize)
        .map((file) => ({
          file,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          progress: 0,
          status: "pending" as const,
        }))

      onFilesChange?.([...files, ...validFiles])
    }

    const handleRemove = (id: string) => {
      onFileRemove?.(id)
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Upload className="size-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Max {formatFileSize(maxSize)} per file
            {maxFiles && ` • Up to ${maxFiles} files`}
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((fileItem) => {
              const FileIcon = getFileIcon(fileItem.file.type)

              return (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <FileIcon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(fileItem.file.size)}
                      </span>
                      {fileItem.status === "uploading" && (
                        <span className="text-xs text-primary">
                          {fileItem.progress}%
                        </span>
                      )}
                      {fileItem.status === "error" && (
                        <span className="text-xs text-destructive">
                          {fileItem.errorMessage || "Upload failed"}
                        </span>
                      )}
                    </div>
                    {fileItem.status === "uploading" && (
                      <Progress value={fileItem.progress} className="h-1 mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {fileItem.status === "success" && (
                      <CheckCircle className="size-5 text-success" />
                    )}
                    {fileItem.status === "error" && (
                      <AlertCircle className="size-5 text-destructive" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(fileItem.id)
                      }}
                      disabled={fileItem.status === "uploading"}
                    >
                      <X className="size-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }

