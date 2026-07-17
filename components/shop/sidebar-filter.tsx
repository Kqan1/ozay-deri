"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";

interface FilterOption {
    id: string;
    name: string;
    options: string[];
}

function CategoryTree({
    parentId,
    categories,
    depth,
    activeCategoryIds,
    handleFilterChange,
    isParentChecked = false,
}: {
    parentId: string | null;
    categories: any[];
    depth: number;
    activeCategoryIds: string[];
    handleFilterChange: (key: string, value: string, isChecked: boolean) => void;
    isParentChecked?: boolean;
}) {
    const children = categories.filter((c) => c.parentId === parentId);
    if (children.length === 0) return null;

    return (
        <div className={`flex flex-col gap-1.5 ${depth > 0 ? "pl-3.5 mt-0.5 border-l border-muted-foreground/40 ml-1" : ""}`}>
            {children.map((cat) => {
                const isExplicitlyChecked = activeCategoryIds.includes(cat.id);
                const isChecked = isExplicitlyChecked || isParentChecked;
                const isDisabled = isParentChecked;

                return (
                    <div key={cat.id} className="flex flex-col gap-1">
                        <label className={`flex items-center space-x-3 group select-none relative ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                            {depth > 0 && (
                                <div className="absolute -left-[14px] top-1/2 w-3 h-[1px] bg-muted-foreground/40 -translate-y-1/2" />
                            )}
                            <div
                                className={`flex items-center justify-center rounded border transition-colors shrink-0 ${isChecked ? "bg-primary border-primary" : "border-input"} ${!isDisabled && "group-hover:border-primary/50"} ${depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5"}`}
                            >
                                {isChecked && (
                                    <svg
                                        className={`text-primary-foreground ${depth === 0 ? "w-3 h-3" : "w-2.5 h-2.5"}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => {
                                    if (!isDisabled) handleFilterChange("category", cat.id, e.target.checked);
                                }}
                            />
                            <span
                                className={`transition-colors ${isChecked ? "text-foreground font-medium" : "text-muted-foreground"} ${!isDisabled && "group-hover:text-foreground"} ${depth === 0 ? "text-sm" : "text-[13px]"}`}
                            >
                                {cat.name}
                            </span>
                        </label>
                        <CategoryTree
                            parentId={cat.id}
                            categories={categories}
                            depth={depth + 1}
                            activeCategoryIds={activeCategoryIds}
                            handleFilterChange={handleFilterChange}
                            isParentChecked={isChecked}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function SidebarFilterContent({
    filterableFields,
    categories = [],
}: {
    filterableFields: FilterOption[];
    categories?: any[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = (key: string, value: string, isChecked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        let currentValues = params.get(key)?.split(",") || [];

        if (isChecked) {
            if (!currentValues.includes(value)) currentValues.push(value);

            if (key === "category") {
                // Remove all descendants of the newly checked category
                const getDescendants = (parentId: string): string[] => {
                    const children = categories.filter((c) => c.parentId === parentId).map((c) => c.id);
                    let all = [...children];
                    for (const child of children) {
                        all = [...all, ...getDescendants(child)];
                    }
                    return all;
                };
                const descendants = getDescendants(value);
                currentValues = currentValues.filter((v) => !descendants.includes(v));
            }
        } else {
            currentValues = currentValues.filter((v) => v !== value);
        }

        if (currentValues.length > 0) {
            params.set(key, currentValues.join(","));
        } else {
            params.delete(key);
        }

        // Reset page to 1 on filter change
        params.delete("page");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const handleClear = () => {
        const params = new URLSearchParams();
        if (searchParams.has("q")) params.set("q", searchParams.get("q") || "");
        if (searchParams.has("sort")) params.set("sort", searchParams.get("sort") || "");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const hasAnyFilter = Array.from(searchParams.keys()).some((k) => k !== "sort" && k !== "page" && k !== "q");
    const activeFilterableFields = filterableFields.filter((f) => f.options.length > 0);

    if (categories.length === 0 && activeFilterableFields.length === 0) {
        return (
            <div className="flex flex-col gap-6 relative">
                <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">Filtreler</h3>
                        {isPending && <Loader2 className="animate-spin text-muted-foreground w-4 h-4" />}
                    </div>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50 text-center">
                    Seçilebilecek uygun filtre bulunmuyor.
                </div>
            </div>
        );
    }

    const activeCategoryIds = searchParams.get("category")?.split(",") || [];

    // Find the root categories among the provided categories (those whose parent is not in the array)
    const rootCategories = categories.filter(
        (c) => !c.parentId || !categories.some((other) => other.id === c.parentId)
    );

    return (
        <div className="flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">Filtreler</h3>
                    {isPending && <Loader2 className="animate-spin text-muted-foreground w-4 h-4" />}
                </div>
                {hasAnyFilter && (
                    <button
                        onClick={handleClear}
                        className="text-xs text-destructive hover:text-destructive/80 hover:underline cursor-pointer transition-colors"
                    >
                        Temizle
                    </button>
                )}
            </div>

            {categories.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="font-medium text-sm text-foreground">Kategoriler</h4>
                    <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        {rootCategories.map((rootCat) => {
                            const isChecked = activeCategoryIds.includes(rootCat.id);
                            return (
                                <div key={rootCat.id} className="flex flex-col gap-1">
                                    <label className="flex items-center space-x-3 cursor-pointer group select-none relative">
                                        <div
                                            className={`flex items-center justify-center rounded border transition-colors shrink-0 ${isChecked ? "bg-primary border-primary" : "border-input group-hover:border-primary/50"} w-4 h-4`}
                                        >
                                            {isChecked && (
                                                <svg
                                                    className="text-primary-foreground w-3 h-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={(e) => handleFilterChange("category", rootCat.id, e.target.checked)}
                                        />
                                        <span
                                            className={`text-sm transition-colors ${isChecked ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                                        >
                                            {rootCat.name}
                                        </span>
                                    </label>
                                    <CategoryTree
                                        parentId={rootCat.id}
                                        categories={categories}
                                        depth={1}
                                        activeCategoryIds={activeCategoryIds}
                                        handleFilterChange={handleFilterChange}
                                        isParentChecked={isChecked}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {filterableFields.map((field) => {
                if (field.options.length === 0) return null;

                const activeValues = searchParams.get(field.name)?.split(",") || [];

                return (
                    <div key={field.id} className="flex flex-col gap-3">
                        <h4 className="font-medium text-sm text-foreground">{field.name}</h4>
                        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            {field.options.map((opt) => {
                                const isChecked = activeValues.includes(opt);
                                return (
                                    <label
                                        key={opt}
                                        className="flex items-center space-x-3 cursor-pointer group select-none"
                                    >
                                        <div
                                            className={`w-4 h-4 flex items-center justify-center rounded border transition-colors ${isChecked ? "bg-primary border-primary" : "border-input group-hover:border-primary/50"}`}
                                        >
                                            {isChecked && (
                                                <svg
                                                    className="w-3 h-3 text-primary-foreground"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={3}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={(e) => handleFilterChange(field.name, opt, e.target.checked)}
                                        />
                                        <span
                                            className={`text-sm transition-colors ${isChecked ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                                        >
                                            {opt}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function SidebarFilter({
    filterableFields,
    categories = [],
}: {
    filterableFields: FilterOption[];
    categories?: any[];
}) {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="text-base font-semibold text-foreground">Filtreler</h3>
                        <Loader2 className="animate-spin text-muted-foreground w-4 h-4" />
                    </div>
                </div>
            }
        >
            <SidebarFilterContent filterableFields={filterableFields} categories={categories} />
        </Suspense>
    );
}
