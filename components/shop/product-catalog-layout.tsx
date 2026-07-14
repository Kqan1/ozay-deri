import React, { Suspense } from "react";
import MobileFilter from "@/components/shop/mobile-filter";
import SidebarFilter from "@/components/shop/sidebar-filter";
import SortDropdown from "@/components/shop/sort-dropdown";
import ProductGridLayout from "@/components/shop/product-grid-layout";
import ShopPagination from "@/components/shop/shop-pagination";

interface ProductCatalogLayoutProps {
    title?: string;
    subtitle?: string;
    totalCount: number;
    page: number;
    totalPages: number;
    products: any[];
    filterOptions: any[];
    categories?: any[];
    headerChildren?: React.ReactNode;
    emptyMessage?: string;
    emptyDescription?: string;
}

export default function ProductCatalogLayout({
    title,
    subtitle,
    totalCount,
    page,
    totalPages,
    products,
    filterOptions,
    categories = [],
    headerChildren,
    emptyMessage,
    emptyDescription,
}: ProductCatalogLayoutProps) {
    return (
        <div className="flex flex-col gap-4 md:gap-8">
            {(title || subtitle || headerChildren) && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        {title && <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>}
                        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                    </div>
                </div>
            )}

            {headerChildren}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Mobile Filter & Sort Buttons */}
                <div className="flex items-center gap-3 lg:hidden">
                    <Suspense fallback={<div className="flex-1 h-10 bg-muted rounded-md animate-pulse" />}>
                        <div className="flex-1">
                            <MobileFilter filterableFields={filterOptions} categories={categories} />
                        </div>
                    </Suspense>
                    <Suspense fallback={<div className="w-32 h-10 bg-muted rounded-md animate-pulse" />}>
                        <SortDropdown />
                    </Suspense>
                </div>

                {/* Left Sidebar (Filters) for Desktop */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <Suspense fallback={<div className="h-[500px] bg-muted rounded-md animate-pulse" />}>
                        <SidebarFilter filterableFields={filterOptions} categories={categories} />
                    </Suspense>
                </aside>

                {/* Main Content (Results) */}
                <ProductGridLayout
                    products={products}
                    totalCount={totalCount}
                    sortDropdown={
                        <Suspense fallback={<div className="w-32 h-10 bg-muted rounded-md animate-pulse" />}>
                            <SortDropdown />
                        </Suspense>
                    }
                    emptyMessage={emptyMessage || "Ürün Bulunamadı"}
                    emptyDescription={
                        emptyDescription || "Seçtiğiniz filtrelere uygun ürün bulunmamaktadır."
                    }
                />
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="mt-12 border-t pt-8">
                    <Suspense fallback={<div className="h-10 w-full bg-muted rounded-md animate-pulse" />}>
                        <ShopPagination page={page} totalPages={totalPages} />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
