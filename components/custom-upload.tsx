import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";

export function CustomUploadDropzone({
  onUploadBegin,
  onUploadComplete,
}: {
  onUploadBegin: () => void;
  onUploadComplete: (urls: string[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      if (res) {
        onUploadComplete(res.map((r) => r.url));
      }
    },
    onUploadError: (e) => {
      toast.error(`Hata: ${e.message}`);
      setLocalUploading(false);
      onUploadComplete([]); // Signal end of upload on error
    },
    onUploadBegin: () => {
      onUploadBegin();
    },
  });

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setLocalUploading(true);
    onUploadBegin();
    await startUpload(files);
    setLocalUploading(false);
    e.target.value = ""; // Reset input
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = Array.from(e.dataTransfer.files);
    setLocalUploading(true);
    onUploadBegin();
    await startUpload(files);
    setLocalUploading(false);
  };

  const showLoading = isUploading || localUploading;

  return (
    <div
      className={`mt-4 border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center gap-3 relative overflow-hidden ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/10"} ${showLoading ? "opacity-70 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={onDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileChange}
        disabled={showLoading}
      />
      {showLoading ? (
        <>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium">Yükleniyor...</p>
        </>
      ) : (
        <>
          <div className="p-3 bg-muted rounded-full">
            <UploadCloud className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Görsel Yükle</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sürükleyip bırakın veya tıklayın
            </p>
          </div>
        </>
      )}
    </div>
  );
}
