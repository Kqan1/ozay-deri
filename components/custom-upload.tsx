import { useState, useCallback } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CustomUploadDropzone({
    onUploadBegin,
    onUploadComplete,
}: {
    onUploadBegin: () => void;
    onUploadComplete: (urls: string[]) => void;
}) {
    const [isDragging, setIsDragging] = useState(false);
    
    const { startUpload, isUploading } = useUploadThing("productImage", {
        onClientUploadComplete: (res) => {
            if (res) {
                onUploadComplete(res.map(r => r.url));
            }
        },
        onUploadError: (e) => {
            toast.error(`Hata: ${e.message}`);
            onUploadComplete([]); // Signal end of upload on error
        },
        onUploadBegin: () => {
            onUploadBegin();
        }
    });

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        await startUpload(files);
        e.target.value = ''; // Reset input
    };

    const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
        const files = Array.from(e.dataTransfer.files);
        await startUpload(files);
    };

    return (
        <div 
            className={`mt-4 border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center gap-3 relative overflow-hidden ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/10'} ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={onDrop}
        >
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={onFileChange}
                disabled={isUploading}
            />
            {isUploading ? (
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
                        <p className="text-xs text-muted-foreground mt-1">Sürükleyip bırakın veya tıklayın</p>
                    </div>
                </>
            )}
        </div>
    );
}
