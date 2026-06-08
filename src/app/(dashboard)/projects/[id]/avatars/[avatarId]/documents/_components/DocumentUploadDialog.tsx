import { Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { FileUpload } from "@/shared/ui/file-upload";
import { Spinner } from "@/shared/ui/spinner";

const ACCEPTED_FORMATS = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "text/html": [".html", ".htm"],
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
};

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  onUpload: (files: File[]) => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  uploading,
  onUpload,
}: DocumentUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onUpload={onUpload}
          accept={ACCEPTED_FORMATS}
          maxSize={50 * 1024 * 1024}
          maxFiles={100}
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
  );
}
