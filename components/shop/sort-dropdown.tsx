"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, Suspense } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

export type SortOption = {
    value: string;
    label: string;
};

const DEFAULT_OPTIONS: SortOption[] = [
    { value: "relevance", label: "Önerilen (İlişki)" },
    { value: "newest", label: "En Yeniler" },
    { value: "name_asc", label: "A'dan Z'ye" },
    { value: "name_desc", label: "Z'den A'ya" },
];

function SortDropdownContent({ options }: { options: SortOption[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSort = searchParams.get("sort") || "relevance";

    const handleSortChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "relevance") {
            params.delete("sort");
        } else {
            params.set("sort", val);
        }
        params.delete("page");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="flex-1 lg:flex-none">
            <Select value={currentSort} onValueChange={handleSortChange} disabled={isPending}>
                <SelectTrigger className="w-full lg:w-[200px] h-10">
                    <div className="flex items-center gap-2">
                        <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Sıralama" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default function SortDropdown({ options = DEFAULT_OPTIONS }: { options?: SortOption[] }) {
    return (
        <Suspense fallback={
            <div className="flex-1 lg:flex-none">
                <div className="w-full lg:w-[200px] h-10 border rounded-md bg-muted/20 animate-pulse" />
            </div>
        }>
            <SortDropdownContent options={options} />
        </Suspense>
    );
}
