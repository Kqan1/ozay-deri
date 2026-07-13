"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, Suspense } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp } from "lucide-react";

function SortDropdownContent() {
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
                    <SelectItem value="relevance">Önerilen (İlişki)</SelectItem>
                    <SelectItem value="newest">En Yeniler</SelectItem>
                    <SelectItem value="price_asc">Fiyat (Artan)</SelectItem>
                    <SelectItem value="price_desc">Fiyat (Azalan)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export default function SortDropdown() {
    return (
        <Suspense fallback={
            <div className="flex-1 lg:flex-none">
                <div className="w-full lg:w-[200px] h-10 border rounded-md bg-muted/20 animate-pulse" />
            </div>
        }>
            <SortDropdownContent />
        </Suspense>
    );
}
