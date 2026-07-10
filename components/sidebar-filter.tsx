"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface FilterOption {
  id: string;
  name: string;
  options: string[];
}

export default function SidebarFilter({
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

  const handleFilterChange = (
    key: string,
    value: string,
    isChecked: boolean,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    let currentValues = params.get(key)?.split(",") || [];

    if (isChecked) {
      if (!currentValues.includes(value)) currentValues.push(value);
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
    if (searchParams.has("q")) params.set("q", searchParams.get("q")!);
    if (searchParams.has("sort")) params.set("sort", searchParams.get("sort")!);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const hasAnyFilter = Array.from(searchParams.keys()).some(
    (k) => k !== "sort" && k !== "page" && k !== "q",
  );

  return (
    <div className="space-y-8 relative">
      {isPending && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="animate-spin text-white w-6 h-6" />
        </div>
      )}

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold">Filtreler</h3>
        {hasAnyFilter && (
          <button
            onClick={handleClear}
            className="text-xs text-rose-400 flex items-center hover:text-rose-300 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-neutral-200">Kategoriler</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {categories
              .filter((c) => !c.parentId)
              .map((cat) => {
                const isChecked =
                  searchParams.get("category")?.split(",").includes(cat.id) ||
                  false;

                return (
                  <label
                    key={cat.id}
                    className="flex items-center space-x-3 cursor-pointer group select-none"
                  >
                    <div
                      className={`w-4 h-4 flex items-center justify-center rounded border transition-colors ${isChecked ? "bg-indigo-600 border-indigo-600" : "border-neutral-500 group-hover:border-neutral-400"}`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 text-white"
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
                      onChange={(e) =>
                        handleFilterChange("category", cat.id, e.target.checked)
                      }
                    />
                    <span
                      className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-neutral-400 group-hover:text-neutral-300"}`}
                    >
                      {cat.name}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}

      {filterableFields.map((field) => {
        if (field.options.length === 0) return null;

        const activeValues = searchParams.get(field.name)?.split(",") || [];

        return (
          <div key={field.id} className="space-y-4">
            <h4 className="font-medium text-sm text-neutral-200">
              {field.name}
            </h4>
            <div className="space-y-3">
              {field.options.map((opt) => {
                const isChecked = activeValues.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center space-x-3 cursor-pointer group select-none"
                  >
                    <div
                      className={`w-4 h-4 flex items-center justify-center rounded border transition-colors ${isChecked ? "bg-indigo-600 border-indigo-600" : "border-neutral-500 group-hover:border-neutral-400"}`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 text-white"
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
                      onChange={(e) =>
                        handleFilterChange(field.name, opt, e.target.checked)
                      }
                    />
                    <span
                      className={`text-sm transition-colors ${isChecked ? "text-white font-medium" : "text-neutral-400 group-hover:text-neutral-300"}`}
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
