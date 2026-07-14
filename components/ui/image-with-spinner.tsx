"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import SafeImage from "@/components/ui/safe-image";

export function ImageWithSpinner({ src, alt, className }: { src: string; alt?: string; className?: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [currentSrc, setCurrentSrc] = useState(src);

    if (src !== currentSrc) {
        setCurrentSrc(src);
        setIsLoading(true);
    }

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
            )}
            <SafeImage
                src={src}
                alt={alt || ""}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover ${className || ""} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
}
