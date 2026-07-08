import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ImageWithSpinner({ src, alt, className }: { src: string; alt?: string; className?: string }) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={src} 
                alt={alt || ""} 
                className={`${className || ""} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
}
