"use client";

import { Loader2, Search, X } from "lucide-react";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState, Suspense } from "react";
import { getLiveSearchSuggestions } from "@/app/actions/search-actions";

function LiveSearchContent({ forceVisible = false }: { forceVisible?: boolean }) {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isTypingRef = useRef(false);

    // Sync query state with URL when navigating back/forward
    useEffect(() => {
        const q = searchParams.get("q");
        if (q !== null) {
            isTypingRef.current = false;
            setQuery(q);
            setIsOpen(false);
        } else if (window.location.pathname === "/search") {
            isTypingRef.current = false;
            setQuery("");
            setIsOpen(false);
        }
    }, [searchParams]);

    // Global Cmd+K / Ctrl+K shortcut
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Debounce logic
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        if (!isTypingRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await getLiveSearchSuggestions(query);
                setResults(data || []);
                setIsOpen(true);
            } catch (err) {
                console.error("Live search error:", err);
            } finally {
                setIsLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && query.trim()) {
            e.preventDefault();
            isTypingRef.current = false;
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
            inputRef.current?.blur();
        } else if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${forceVisible ? 'block' : 'max-w-md hidden md:block mx-4'} group`}>
            <div 
                className={`relative flex items-center transition-all duration-300 rounded-full border ${
                    isFocused 
                        ? 'ring-4 ring-primary/20 border-primary bg-background shadow-lg' 
                        : 'border-input bg-muted/40 hover:bg-muted/80 shadow-sm'
                }`}
            >
                <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        isTypingRef.current = true;
                        setQuery(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        setIsFocused(true);
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ürün, kategori vb. ara..."
                    className="block w-full bg-transparent py-2.5 pl-11 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                    autoComplete="off"
                    spellCheck="false"
                />

                {/* Right side actions */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1">
                    {query ? (
                        <button 
                            onClick={() => { 
                                setQuery(''); 
                                setResults([]); 
                                setIsOpen(false); 
                                inputRef.current?.focus(); 
                            }}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none"
                            aria-label="Aramayı temizle"
                        >
                            <X size={14} />
                        </button>
                    ) : null}
                    
                    <button
                        onClick={() => {
                            if (query.trim()) {
                                isTypingRef.current = false;
                                setIsOpen(false);
                                router.push(`/search?q=${encodeURIComponent(query)}`);
                                inputRef.current?.blur();
                            }
                        }}
                        className={`p-1.5 rounded-full flex items-center justify-center transition-all ${
                            query.trim() 
                                ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer" 
                                : "bg-muted text-muted-foreground opacity-50 cursor-default pointer-events-none"
                        }`}
                        aria-label="Arama yap"
                        aria-disabled={!query.trim()}
                    >
                        <Search size={14} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-3 w-full rounded-2xl border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2.5 border-b bg-muted/30">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Arama Sonuçları</span>
                    </div>
                    <ul className="max-h-96 overflow-y-auto p-2 space-y-1">
                        {results.map((product) => (
                            <li key={product.id}>
                                <Link
                                    href={`/products/${product.id}`}
                                    onClick={() => {
                                        setIsOpen(false);
                                        inputRef.current?.blur();
                                    }}
                                    className="flex items-center gap-4 rounded-xl p-2 hover:bg-accent/60 transition-all duration-200 group"
                                >
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-muted overflow-hidden relative shadow-sm group-hover:shadow transition-shadow">
                                        {product.thumbnail ? (
                                            <ImageWithSpinner
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground bg-secondary/50">
                                                Görsel Yok
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{product.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {product.categoryName && (
                                                <span className="text-[10px] font-medium bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full truncate">
                                                    {product.categoryName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function LiveSearch({ forceVisible = false }: { forceVisible?: boolean }) {
    return (
        <Suspense 
            fallback={
                <div className={`relative w-full ${forceVisible ? 'block' : 'max-w-md hidden md:block mx-4'}`}>
                    <div className="relative flex items-center rounded-full border border-input bg-muted/40 shadow-sm h-[42px]">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
                            <Search size={18} />
                        </div>
                    </div>
                </div>
            }
        >
            <LiveSearchContent forceVisible={forceVisible} />
        </Suspense>
    );
}
