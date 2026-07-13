"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import SidebarFilter from "./sidebar-filter";

interface FilterOption {
    id: string;
    name: string;
    options: string[];
}

export default function MobileFilter({
    filterableFields,
    categories = [],
}: {
    filterableFields: FilterOption[];
    categories?: any[];
}) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden w-full flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" /> Filtreler
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto px-4 py-6">
                <SheetTitle className="hidden">Filtreler</SheetTitle>
                <SheetDescription className="hidden">Arama sonuçlarını daraltmak için filtreleri kullanın.</SheetDescription>
                <SidebarFilter filterableFields={filterableFields} categories={categories} />
            </SheetContent>
        </Sheet>
    );
}
