"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import LiveSearch from "@/components/ui/live-search";

export default function MobileSearchButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 -mr-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                aria-label="Arama menüsünü aç"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="absolute top-[60px] -right-16 w-[100vw] sm:w-[400px] p-4 bg-card/95 backdrop-blur-xl border-b shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200">
                    <LiveSearch forceVisible />
                </div>
            )}
        </div>
    );
}
