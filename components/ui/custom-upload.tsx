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

    const processFiles = async (files: File[]) => {
        const results = await Promise.all(
            files.map(async (file) => {
                let currentFile = file;

                // 1. HEIC Kontrolü ve Dönüştürme
                if (
                    currentFile.type === "image/heic" ||
                    currentFile.type === "image/heif" ||
                    currentFile.name.toLowerCase().endsWith(".heic") ||
                    currentFile.name.toLowerCase().endsWith(".heif")
                ) {
                    try {
                        const heic2any = (await import("heic2any")).default;
                        const convertedBlob = await heic2any({ blob: currentFile, toType: "image/jpeg", quality: 0.8 });
                        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                        const newFileName = currentFile.name.replace(/\.hei[cf]$/i, ".jpg");
                        currentFile = new File([blob], newFileName, { type: "image/jpeg" });
                    } catch (err) {
                        toast.error(`${currentFile.name} dönüştürülemedi. Lütfen dosyayı .jpg olarak kaydedip tekrar deneyin.`);
                        return null;
                    }
                }

                // 2. Genel Fotoğraf Sıkıştırma (Compress)
                // GIF ve SVG gibi boyutlandırma istemediğimiz formatları hariç tutuyoruz.
                if (currentFile.type.startsWith("image/") && !currentFile.type.includes("svg") && !currentFile.type.includes("gif")) {
                    try {
                        const imageCompression = (await import("browser-image-compression")).default;
                        const options = {
                            maxSizeMB: 0.8, // Maksimum 800 KB olacak şekilde sıkıştır
                            maxWidthOrHeight: 1600, // Genişlik/Yükseklik maksimum 1600px
                            useWebWorker: true,
                            initialQuality: 0.8, // %80 kalite
                        };
                        const compressedBlob = await imageCompression(currentFile, options);
                        currentFile = new File([compressedBlob], currentFile.name, { type: compressedBlob.type });
                    } catch (err) {
                        // Eğer sıkıştırma hata verirse sessizce orijinal dosyayı yolla
                    }
                }

                return currentFile;
            })
        );
        return results.filter((f): f is File => f !== null);
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setLocalUploading(true);
        onUploadBegin();
        let files = Array.from(e.target.files);
        files = await processFiles(files);
        await startUpload(files);
        setLocalUploading(false);
        e.target.value = ""; // Reset input
    };

    const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
        setLocalUploading(true);
        onUploadBegin();
        let files = Array.from(e.dataTransfer.files);
        files = await processFiles(files);
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
                accept="image/*,.heic,.heif"
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
                        <p className="text-xs text-muted-foreground mt-1">Sürükleyip bırakın veya tıklayın</p>
                    </div>
                </>
            )}
        </div>
    );
}
