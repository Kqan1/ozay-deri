"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import GridSelector from "./grid-selector";
import ProductModalLink from "./product-modal-link";

export type StandardProduct = {
    id: string;
    name: string;
    image: string | null;
    categoryName?: string;
    description?: string;
};

export default function ProductGridLayout({
    products,
    totalCount,
    sortDropdown,
    emptyMessage = "Ürün Bulunamadı",
    emptyDescription = "Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.",
}: {
    products: StandardProduct[];
    totalCount: number;
    sortDropdown: React.ReactNode;
    emptyMessage?: string;
    emptyDescription?: string;
}) {
    const _searchParams = useSearchParams();
    const _pathname = usePathname();
    const [gridParam, setGridParam] = useState("4");

    useEffect(() => {
        const savedGrid = localStorage.getItem("preferredGrid");
        if (savedGrid) {
            setGridParam(savedGrid);
        }
    }, []);

    const handleGridChange = (val: string) => {
        setGridParam(val);
        localStorage.setItem("preferredGrid", val);
    };

    let gridClasses = "grid gap-3 md:gap-6 ";
    const cardClasses = "group block h-full";
    const imageWrapperClasses =
        "aspect-[4/5] relative rounded-xl overflow-hidden bg-card border group-hover:border-primary/50 transition-colors";
    const contentWrapperClasses = "mt-4 space-y-1";

    if (gridParam === "2") {
        gridClasses += "grid-cols-2";
    } else if (gridParam === "3") {
        gridClasses += "grid-cols-2 md:grid-cols-3";
    } else {
        gridClasses += "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    }

    return (
        <main className="flex-1">
            <div className="hidden lg:flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground font-medium">{totalCount} ürün bulundu</div>
                <div className="flex items-center gap-3">
                    <GridSelector currentGrid={gridParam} onChange={handleGridChange} />
                    {sortDropdown}
                </div>
            </div>
            {products.length === 0 ? (
                <div className="text-center py-20 bg-muted/50 border rounded-xl">
                    <h3 className="text-xl font-medium mb-2 text-foreground">{emptyMessage}</h3>
                    <p className="text-muted-foreground text-sm">{emptyDescription}</p>
                </div>
            ) : (
                <div className={gridClasses}>
                    {products.map((product) => (
                        <ProductModalLink key={product.id} productId={product.id} className={cardClasses}>
                            <div className={imageWrapperClasses}>
                                {product.image ? (
                                    <ImageWithSpinner
                                        src={product.image}
                                        alt={product.name}
                                        className="group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                        Görsel Yok
                                    </div>
                                )}
                            </div>
                            <div className={contentWrapperClasses}>
                                <h3 className="text-sm sm:text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                                )}
                                {product.categoryName && (
                                    <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                                )}
                            </div>
                        </ProductModalLink>
                    ))}
                </div>
            )}
        </main>
    );
}
