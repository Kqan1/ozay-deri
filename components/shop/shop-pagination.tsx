"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

function ShopPaginationContent({ page, totalPages }: { page: number; totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createUrl = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Generate page numbers
    let pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        if (page <= 3) {
            pages = [1, 2, 3, 4, "...", totalPages];
        } else if (page >= totalPages - 2) {
            pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, "...", page - 1, page, page + 1, "...", totalPages];
        }
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={hasPrevPage ? createUrl(page - 1) : "#"}
                        className={!hasPrevPage ? "pointer-events-none opacity-50" : ""}
                        aria-disabled={!hasPrevPage}
                    />
                </PaginationItem>

                {pages.map((p, i) => (
                    <PaginationItem key={i}>
                        {p === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink href={createUrl(p)} isActive={page === p}>
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href={hasNextPage ? createUrl(page + 1) : "#"}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
                        aria-disabled={!hasNextPage}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

export default function ShopPagination({ page, totalPages }: { page: number; totalPages: number }) {
    return (
        <Suspense fallback={<div className="h-10" />}>
            <ShopPaginationContent page={page} totalPages={totalPages} />
        </Suspense>
    );
}
