"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface MapIframeProps {
    src: string;
    title?: string;
    className?: string;
    iframeClassName?: string;
}

export default function MapIframe({ src, title = "Harita", className = "", iframeClassName = "" }: MapIframeProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // If the page is already fully loaded (e.g. client side navigation)
        if (document.readyState === "complete") {
            setIsMounted(true);
        } else {
            // Wait for the main page to completely finish loading before injecting iframe
            const handleLoad = () => setIsMounted(true);
            window.addEventListener("load", handleLoad);
            return () => window.removeEventListener("load", handleLoad);
        }
    }, []);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {(!isMounted || isLoading) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 backdrop-blur-sm z-10 text-muted-foreground gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-medium animate-pulse">Harita Yükleniyor...</span>
                </div>
            )}
            {isMounted && (
                <iframe
                    title={title}
                    src={src}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"} ${iframeClassName}`}
                    onLoad={() => setIsLoading(false)}
                />
            )}
        </div>
    );
}
