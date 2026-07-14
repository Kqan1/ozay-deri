"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getProductById } from "@/app/actions/product-actions";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import { Loader2, X } from "lucide-react";

export default function GlobalProductModal() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    
    const productId = searchParams.get("productId");
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    useEffect(() => {
        if (productId) {
            setIsLoading(true);
            getProductById(productId).then(data => {
                setProduct(data);
                setActiveImageIndex(0);
                setIsLoading(false);
            });
        } else {
            setProduct(null);
        }
    }, [productId]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("productId");
            window.history.pushState(null, '', `${pathname}?${newParams.toString()}`);
        }
    };

    return (
        <Dialog open={!!productId} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-2xl [&>button]:hidden">
                <DialogTitle className="sr-only">Ürün Detayları</DialogTitle>
                <DialogDescription className="sr-only">Seçilen ürünün tüm detayları.</DialogDescription>

                {/* Custom Close Button for Mobile Overlay - Fixed at top of modal */}
                <div className="absolute top-4 right-4 z-50 md:hidden">
                    <button 
                        onClick={() => handleOpenChange(false)}
                        className="p-2 bg-background/50 backdrop-blur-md rounded-full text-foreground hover:bg-background/80 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading || !product ? (
                    <div className="flex flex-col md:flex-row min-h-[80vh] max-h-[90vh] overflow-y-auto md:overflow-hidden">
                        {/* Skeleton Left */}
                        <div className="w-full md:w-1/2 relative bg-muted/20 overflow-hidden flex flex-col h-[55vh] md:h-auto md:min-h-[80vh] shrink-0 animate-pulse">
                            <div className="absolute top-4 right-4 md:hidden w-9 h-9 rounded-full bg-background/50"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground/30" />
                            </div>
                        </div>

                        {/* Skeleton Right */}
                        <div className="w-full md:w-1/2 flex flex-col bg-background relative shrink-0 p-6 md:p-10 lg:p-12">
                            <div className="absolute top-6 right-6 hidden md:block w-10 h-10 rounded-full bg-muted/30 animate-pulse"></div>
                            <div className="space-y-6 w-full mt-2">
                                <div>
                                    <div className="h-5 w-24 bg-muted/60 rounded-full mb-3 animate-pulse"></div>
                                    <div className="h-10 w-3/4 bg-muted/60 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="space-y-3 mt-6">
                                    <div className="h-4 w-full bg-muted/40 rounded animate-pulse"></div>
                                    <div className="h-4 w-full bg-muted/40 rounded animate-pulse"></div>
                                    <div className="h-4 w-5/6 bg-muted/40 rounded animate-pulse"></div>
                                    <div className="h-4 w-4/6 bg-muted/40 rounded animate-pulse"></div>
                                </div>
                                <div className="h-px w-full bg-border my-6" />
                                <div>
                                    <div className="h-6 w-40 bg-muted/60 rounded mb-4 animate-pulse"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-muted/20 p-4 rounded-xl border border-border/30 h-[76px] animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row min-h-[80vh] max-h-[90vh] overflow-y-auto md:overflow-hidden">
                        {/* Left: Images */}
                        <div className="w-full md:w-1/2 relative bg-muted/10 overflow-hidden flex flex-col h-[55vh] md:h-auto md:min-h-[80vh] shrink-0">
                            {/* Main Active Image */}
                            <div className="flex-1 relative w-full h-full">
                                {product.images?.length > 0 ? (
                                    <ImageWithSpinner 
                                        src={product.images[activeImageIndex] || product.images[0]} 
                                        alt={product.name} 
                                        className="object-contain w-full h-full absolute inset-0"
                                    />
                                ) : (
                                    <div className="w-full h-full absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/30">
                                        Görsel Bulunamadı
                                    </div>
                                )}
                            </div>

                            {/* Floating/Bottom Thumbnail Gallery Bar */}
                            {product.images?.length > 1 && (
                                <div className="absolute bottom-3 md:bottom-6 left-0 right-0 px-2 md:px-4 z-20 flex justify-center">
                                    <div className="flex gap-2 md:gap-3 overflow-x-auto p-1.5 md:p-2.5 bg-background border rounded-2xl shadow-lg max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                        {product.images.map((img: string, i: number) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setActiveImageIndex(i)}
                                                className={`relative shrink-0 w-12 h-16 md:w-16 md:h-20 rounded-xl overflow-hidden ring-2 transition-all duration-300 ${activeImageIndex === i ? 'ring-primary scale-105 shadow-md' : 'ring-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                                            >
                                                <ImageWithSpinner src={img} alt={`Thumbnail ${i}`} className="object-cover w-full h-full" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="w-full md:w-1/2 flex flex-col bg-background relative shrink-0">
                            {/* Custom Close Button for Desktop */}
                            <button 
                                onClick={() => handleOpenChange(false)}
                                className="absolute top-6 right-6 z-50 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition hidden md:block"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="p-6 md:p-10 lg:p-12 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {/* Header */}
                                    <div>
                                        {product.category?.name && (
                                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase rounded-full mb-3">
                                                {product.category.name}
                                            </span>
                                        )}
                                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                                            {product.name}
                                        </h1>
                                    </div>

                                    {/* Description / Summary Field */}
                                    {product.fields?.find((f: any) => f.name.toLowerCase().includes("açıklama") || f.name.toLowerCase().includes("description"))?.stringValue && (
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                            {product.fields.find((f: any) => f.name.toLowerCase().includes("açıklama") || f.name.toLowerCase().includes("description")).stringValue}
                                        </div>
                                    )}

                                    <div className="h-px w-full bg-border" />

                                    {/* Specifications Grid */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-foreground">Ürün Özellikleri</h3>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                            {product.fields
                                                ?.filter((f: any) => f.name !== "Thumbnail" && !f.name.toLowerCase().includes("açıklama") && !f.name.toLowerCase().includes("description"))
                                                .map((field: any) => (
                                                <div key={field.id} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                                    <dt className="text-sm font-medium text-muted-foreground mb-1">{field.name}</dt>
                                                    <dd className="text-base font-semibold text-foreground">
                                                        {field.type === "STRING" ? field.stringValue : `${field.numberValue} ${field.unit || ""}`}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
