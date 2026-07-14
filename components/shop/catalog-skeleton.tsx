export default function CatalogSkeleton() {
    return (
        <div className="flex flex-col gap-4 md:gap-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-64 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-4">
                {/* Mobile Filter & Sort Skeleton */}
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="flex-1 h-10 bg-muted rounded-md"></div>
                    <div className="w-32 h-10 bg-muted rounded-md"></div>
                </div>

                {/* Desktop Sidebar Skeleton */}
                <aside className="hidden lg:block w-64 shrink-0 space-y-6">
                    <div className="h-6 w-24 bg-muted rounded border-b pb-2 mb-4"></div>
                    {[1, 2, 3].map((group) => (
                        <div key={group} className="space-y-3">
                            <div className="h-4 w-20 bg-muted rounded"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-muted rounded"></div>
                                        <div className="h-3 w-16 bg-muted rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </aside>

                {/* Product Grid Skeleton */}
                <div className="flex-1">
                    {/* Top bar (Sort) Desktop */}
                    <div className="hidden lg:flex justify-end mb-6">
                        <div className="w-32 h-10 bg-muted rounded-md"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-muted rounded-xl border"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
