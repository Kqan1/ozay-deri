import db from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import Link from "next/link";
import Image from "next/image";
import { logEmptySearch } from "@/app/actions/search-actions";
import { ChevronRight, FilterX } from "lucide-react";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q as string;
  const page = Number(resolvedParams.page) || 1;
  
  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-semibold mb-2">Arama</h2>
        <p className="text-neutral-400">Lütfen aramak istediğiniz kelimeyi giriniz.</p>
      </div>
    );
  }

  // 1. Find all filterable fields globally
  const filterableFields = await db.fieldDefinition.findMany({
    where: { isFilterable: true }
  });

  // 2. Extract selected filters from searchParams
  const activeFilters: Record<string, string> = {};
  for (const field of filterableFields) {
    if (resolvedParams[field.name]) {
      activeFilters[field.name] = resolvedParams[field.name] as string;
    }
  }

  // 3. Construct raw query safely using Prisma.sql
  let filterConditions = Prisma.empty;
  const filterKeys = Object.keys(activeFilters);
  if (filterKeys.length > 0) {
    const conditions = filterKeys.map(key => {
      return Prisma.sql`EXISTS (
        SELECT 1 FROM "ProductField" pf 
        WHERE pf."productId" = p.id 
          AND pf.name = ${key} 
          AND pf."stringValue" = ${activeFilters[key]}
      )`;
    });
    filterConditions = Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}`;
  }

  const query = Prisma.sql`
    SELECT 
      p.id, 
      p.name, 
      c.name as "categoryName",
      (
        SELECT "numberValue" 
        FROM "ProductField" pf 
        WHERE pf."productId" = p.id AND pf.name = 'Fiyat'
        LIMIT 1
      ) as price,
      (
        SELECT "stringValue" 
        FROM "ProductField" pf 
        WHERE pf."productId" = p.id AND pf.name = 'Thumbnail'
        LIMIT 1
      ) as thumbnail,
      GREATEST(similarity(p.name, ${q}), COALESCE(similarity(c.name, ${q}), 0)) as "simScore"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE (
       similarity(p.name, ${q}) > 0.1
       OR similarity(c.name, ${q}) > 0.1
       OR EXISTS (
          SELECT 1 FROM "ProductField" pf
          JOIN "FieldDefinition" fd ON pf.name = fd.name
          WHERE pf."productId" = p.id 
            AND fd."isSearchable" = true
            AND similarity(pf."stringValue", ${q}) > 0.1
       )
    )
    ${filterConditions}
    ORDER BY GREATEST(similarity(p.name, ${q}), COALESCE(similarity(c.name, ${q}), 0)) DESC
    LIMIT 12 OFFSET ${(page - 1) * 12}
  `;

  const results = await db.$queryRaw(query) as any[];

  console.log(`\n[Detailed Search] Query: "${q}"`);
  if (filterKeys.length > 0) console.log(`Filters:`, activeFilters);
  console.log(`Results:`, results.map(r => ({ name: r.name, simScore: r.simScore })));

  if (results.length === 0 && page === 1 && filterKeys.length === 0) {
    await logEmptySearch(q);
  }

  // 4. Fetch possible values for filterable fields for Sidebar
  const filterOptions = await Promise.all(
    filterableFields.map(async (field) => {
      const distinctValues = await db.productField.findMany({
        where: { name: field.name, stringValue: { not: null } },
        distinct: ['stringValue'],
        select: { stringValue: true }
      });
      return {
        ...field,
        options: distinctValues.map(v => v.stringValue).filter(Boolean) as string[]
      };
    })
  );

  const hasNextPage = results.length === 12;

  // Helper to build URL with new or removed filter
  const buildFilterUrl = (key: string, value?: string) => {
    const params = new URLSearchParams();
    params.set("q", q);
    for (const [k, v] of Object.entries(activeFilters)) {
      if (k !== key) params.set(k, v);
    }
    if (value) params.set(key, value);
    return `/search?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="flex items-center text-sm text-neutral-400 mb-8 space-x-2">
        <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
        <ChevronRight size={14} />
        <span className="text-white">"{q}" için sonuçlar</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar (Filters) */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold">Filtreler</h3>
            {filterKeys.length > 0 && (
              <Link href={`/search?q=${q}`} className="text-xs text-rose-400 flex items-center hover:text-rose-300">
                <FilterX size={14} className="mr-1" /> Temizle
              </Link>
            )}
          </div>

          {filterOptions.map((field) => {
            if (field.options.length === 0) return null;
            const isActive = activeFilters[field.name];

            return (
              <div key={field.id} className="space-y-4">
                <h4 className="font-medium text-sm text-neutral-200">{field.name}</h4>
                <div className="space-y-2">
                  <Link
                    href={buildFilterUrl(field.name)}
                    className={`block text-sm transition-colors ${!isActive ? "text-indigo-400 font-medium" : "text-neutral-400 hover:text-white"}`}
                  >
                    Tümü
                  </Link>
                  {field.options.map((opt) => (
                    <Link
                      key={opt}
                      href={buildFilterUrl(field.name, opt)}
                      className={`block text-sm transition-colors ${isActive === opt ? "text-indigo-400 font-medium" : "text-neutral-400 hover:text-white"}`}
                    >
                      {opt}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main Content (Results) */}
        <main className="flex-1">
          {results.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-medium mb-2">Sonuç Bulunamadı</h3>
              <p className="text-neutral-400 text-sm">
                "{q}" için arama kriterlerinize uyan bir ürün bulamadık. Lütfen farklı kelimelerle veya filtreleri temizleyerek tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                  <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-neutral-900 border border-white/5 group-hover:border-indigo-500/50 transition-colors">
                    {product.thumbnail ? (
                      <Image src={product.thumbnail} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-600">Görsel Yok</div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                    {product.categoryName && <p className="text-xs text-neutral-500">{product.categoryName}</p>}
                    {product.price && <p className="text-sm font-semibold text-emerald-400 mt-2">{product.price} ₺</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {(page > 1 || hasNextPage) && (
            <div className="mt-12 flex items-center justify-center space-x-4 border-t border-white/10 pt-8">
              {page > 1 && (
                <Link
                  href={`/search?q=${q}&page=${page - 1}`}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Önceki Sayfa
                </Link>
              )}
              {hasNextPage && (
                <Link
                  href={`/search?q=${q}&page=${page + 1}`}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Sonraki Sayfa
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
