import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageService } from "@/services/data.service";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  url: string;
  fileType: string;
}

interface FileUploadProps {
  entityType: string;
  entityId: string | null;
  lang: "pt" | "en";
  maxSizeMB?: number;
  accept?: string;
  existingFiles?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  /** Queue files when entityId is null; call flushQueue(entityId) after creation */
  pendingQueue?: File[];
  onPendingChange?: (files: File[]) => void;
}

export function FileUpload({
  entityType,
  entityId,
  lang,
  maxSizeMB = 10,
  accept = ".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg",
  existingFiles = [],
  onFilesChange,
  pendingQueue = [],
  onPendingChange,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList);
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxBytes) {
        toast.error(lang === "pt" ? `${file.name} excede ${maxSizeMB}MB` : `${file.name} exceeds ${maxSizeMB}MB`);
        return;
      }
    }

    // If no entityId yet, queue the files
    if (!entityId) {
      onPendingChange?.([...pendingQueue, ...files]);
      return;
    }

    setUploading(true);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of files) {
        const result = await storageService.uploadAttachment(file, entityType, entityId);
        uploaded.push({
          id: result.id,
          name: result.name,
          size: result.size,
          sizeFormatted: result.size_formatted,
          url: result.url,
          fileType: result.file_type,
        });
      }
      onFilesChange?.([...existingFiles, ...uploaded]);
      toast.success(lang === "pt" ? "Arquivo(s) enviado(s)" : "File(s) uploaded");
    } catch (err: any) {
      toast.error(err.message || (lang === "pt" ? "Erro no upload" : "Upload failed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [entityId, entityType, existingFiles, lang, maxSizeMB, onFilesChange, onPendingChange, pendingQueue]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removePending = (index: number) => {
    const next = [...pendingQueue];
    next.splice(index, 1);
    onPendingChange?.(next);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div
        className="rounded-lg border-2 border-dashed border-border p-4 text-center cursor-pointer transition-colors hover:border-primary/40 hover:bg-accent/30"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">{lang === "pt" ? "Enviando..." : "Uploading..."}</span>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "pt" ? "Arraste arquivos aqui ou clique para anexar" : "Drag files here or click to attach"}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              PDF, DOCX, XLSX, PPTX (max {maxSizeMB}MB)
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Pending files (before entity is saved) */}
      {pendingQueue.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground">
            {lang === "pt" ? "Arquivos pendentes (serão enviados ao salvar)" : "Pending files (will upload on save)"}
          </p>
          {pendingQueue.map((file, i) => (
            <div key={`pending-${i}`} className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 truncate text-xs text-foreground">{file.name}</span>
              <span className="text-[10px] text-muted-foreground">{formatSize(file.size)}</span>
              <button onClick={(e) => { e.stopPropagation(); removePending(i); }} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Already uploaded files */}
      {existingFiles.length > 0 && (
        <div className="space-y-1">
          {existingFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-xs text-primary hover:underline">
                {file.name}
              </a>
              <span className="text-[10px] text-muted-foreground">{file.sizeFormatted}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Upload queued files after entity creation */
export async function flushPendingUploads(
  files: File[],
  entityType: string,
  entityId: string,
): Promise<void> {
  for (const file of files) {
    await storageService.uploadAttachment(file, entityType, entityId);
  }
}
