import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  FileText,
  FileSpreadsheet,
  Image,
  File,
  X,
  Upload,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EmailAttachmentUploadProps {
  attachments: AttachmentFile[];
  onAdd: (file: AttachmentFile) => void;
  onRemove: (id: string) => void;
  maxSizeBytes?: number;
}

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const getFileIcon = (type: string) => {
  if (type.includes('pdf') || type.includes('word')) {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  if (type.includes('excel') || type.includes('sheet')) {
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  }
  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }
  return <File className="w-5 h-5 text-muted-foreground" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function EmailAttachmentUpload({
  attachments,
  onAdd,
  onRemove,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
}: EmailAttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error('Dateityp nicht unterstützt', {
        description: 'Erlaubt sind: PDF, Word, Excel, PNG, JPG',
      });
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error('Datei zu groß', {
        description: `Maximum: ${formatFileSize(maxSizeBytes)}`,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Nicht angemeldet');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Simulate progress since Supabase doesn't provide upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('email-attachments')
        .upload(fileName, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('email-attachments')
        .getPublicUrl(fileName);

      setUploadProgress(100);

      onAdd({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
      });

      toast.success('Datei hochgeladen');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload fehlgeschlagen', { description: error.message });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(uploadFile);
    },
    [uploadFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <Progress value={uploadProgress} className="max-w-[200px] mx-auto" />
            <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Dateien hierher ziehen oder
            </p>
            <label>
              <input
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">Dateien auswählen</span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              PDF, Word, Excel, Bilder • Max. {formatFileSize(maxSizeBytes)}
            </p>
          </>
        )}
      </div>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(file.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
