"use client";

import { Grid2x2, Grid3x3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GridSelector({
    currentGrid,
    onChange,
}: {
    currentGrid: string;
    onChange: (val: string) => void;
}) {
    const options = [
        { value: "2", icon: Grid2x2, title: "2'li Grid", hiddenOnMobile: false },
        { value: "3", icon: Grid3x3, title: "3'lü Grid", hiddenOnMobile: true },
        { value: "4", icon: LayoutGrid, title: "4'lü Grid", hiddenOnMobile: true },
    ];

    return (
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = currentGrid === opt.value;
                return (
                    <button
                        key={opt.value}
                        title={opt.title}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "p-2 rounded-sm transition-all text-muted-foreground hover:text-foreground",
                            isActive && "bg-background shadow-sm text-foreground",
                            opt.hiddenOnMobile && "hidden md:block",
                        )}
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                );
            })}
        </div>
    );
}
