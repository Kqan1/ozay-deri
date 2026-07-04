"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { getLiveSearchSuggestions } from "@/app/actions/search-actions";
import Link from "next/link";
import Image from "next/image";

export default function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsOpen(false);
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
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm hidden md:block mx-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="Ürün, kategori vb. ara..."
          className="block w-full rounded-full border border-white/20 bg-black/40 py-1.5 pl-10 pr-4 text-sm text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 backdrop-blur-sm transition-all"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          <ul className="max-h-80 overflow-y-auto p-2 space-y-1">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 rounded-md bg-neutral-800 overflow-hidden relative">
                    {product.thumbnail ? (
                       <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 text-center leading-tight bg-neutral-800">No Img</div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-white">{product.name}</span>
                    <span className="truncate text-xs text-neutral-400 flex items-center gap-1">
                      {product.categoryName && <span className="bg-white/10 px-1.5 rounded-sm">{product.categoryName}</span>}
                      {product.price && <span className="text-emerald-400 font-semibold">{product.price} ₺</span>}
                    </span>
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
