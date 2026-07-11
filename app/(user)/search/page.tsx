import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { logEmptySearch } from "@/app/actions/search-actions";
import { Prisma } from "@/app/generated/prisma/client";
import SidebarFilter from "@/components/shop/sidebar-filter";
import db from "@/lib/db";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const q = resolvedParams.q as string;
    const page = Number(resolvedParams.page) || 1;
    const categoryParam = resolvedParams.category as string | undefined;
    const categoryIds = categoryParam ? categoryParam.split(",") : [];

    if (!q) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <h2 className="text-2xl font-semibold mb-2">Arama</h2>
                <p className="text-neutral-400">Lütfen aramak istediğiniz kelimeyi giriniz.</p>
            </div>
        );
    }

    // 1. Find all filterable fields globally or for the selected category
    const filterableFields = await db.fieldDefinition.findMany({
        where: {
            isFilterable: true,
            ...(categoryIds.length > 0 ? { OR: [{ isGlobal: true }, { categoryId: { in: categoryIds } }] } : {}),
        },
    });

    const categories = await db.category.findMany({
        where: { isHidden: false },
        select: { id: true, name: true, parentId: true },
    });

    // 2. Extract selected filters from searchParams
    const activeFilters: Record<string, string[]> = {};
    for (const field of filterableFields) {
        const rawVal = resolvedParams[field.name];
        if (rawVal) {
            activeFilters[field.name] = typeof rawVal === "string" ? rawVal.split(",") : rawVal;
        }
    }

    // 3. Construct raw query safely using Prisma.sql
    let filterConditions = Prisma.empty;
    const filterKeys = Object.keys(activeFilters);
    if (filterKeys.length > 0) {
        const conditions = filterKeys.map((key) => {
            const values = activeFilters[key];
            return Prisma.sql`EXISTS (
        SELECT 1 FROM "ProductField" pf 
        WHERE pf."productId" = p.id 
          AND pf.name = ${key} 
          AND pf."stringValue" = ANY(ARRAY[${Prisma.join(values)}]::text[])
      )`;
        });
        filterConditions = Prisma.sql`AND ${Prisma.join(conditions, " AND ")}`;
    }

    if (categoryIds.length > 0) {
        const catCond = Prisma.sql`(p."categoryId" = ANY(ARRAY[${Prisma.join(categoryIds)}]::text[]) OR c."parentId" = ANY(ARRAY[${Prisma.join(categoryIds)}]::text[]))`;
        if (filterKeys.length > 0) {
            filterConditions = Prisma.sql`${filterConditions} AND ${catCond}`;
        } else {
            filterConditions = Prisma.sql`AND ${catCond}`;
        }
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

    const results = (await db.$queryRaw(query)) as any[];

    console.log(`\n[Detailed Search] Query: "${q}"`);
    if (filterKeys.length > 0) console.log(`Filters:`, activeFilters);
    console.log(
        `Results:`,
        results.map((r) => ({ name: r.name, simScore: r.simScore })),
    );

    if (results.length === 0 && page === 1 && filterKeys.length === 0) {
        await logEmptySearch(q);
    }

    // 4. Fetch possible values for filterable fields for Sidebar
    const filterOptions = await Promise.all(
        filterableFields.map(async (field) => {
            const distinctValues = await db.productField.findMany({
                where: { name: field.name, stringValue: { not: null } },
                distinct: ["stringValue"],
                select: { stringValue: true },
            });
            return {
                ...field,
                options: distinctValues.map((v) => v.stringValue).filter(Boolean) as string[],
            };
        }),
    );

    const hasNextPage = results.length === 12;

    // Helper to build URL with new or removed filter
    const _buildFilterUrl = (key: string, value?: string) => {
        const params = new URLSearchParams();
        params.set("q", q);
        for (const [k, v] of Object.entries(activeFilters)) {
            if (k !== key) params.set(k, v.join(","));
        }
        if (value) params.set(key, value);
        return `/search?${params.toString()}`;
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center text-sm text-muted-foreground mb-8 space-x-2">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Ana Sayfa
                </Link>
                <ChevronRight size={14} />
                <span className="text-foreground">"{q}" için sonuçlar</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Sidebar (Filters) */}
                <aside className="w-full lg:w-64 shrink-0">
                    <SidebarFilter filterableFields={filterOptions} categories={categories} />
                </aside>

                {/* Main Content (Results) */}
                <main className="flex-1">
                    {results.length === 0 ? (
                        <div className="text-center py-20 bg-muted/50 border rounded-xl">
                            <h3 className="text-xl font-medium mb-2 text-foreground">Sonuç Bulunamadı</h3>
                            <p className="text-muted-foreground text-sm">
                                "{q}" için arama kriterlerinize uyan bir ürün bulamadık. Lütfen farklı kelimelerle veya
                                filtreleri temizleyerek tekrar deneyin.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.map((product) => (
                                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                                    <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-card border group-hover:border-primary/50 transition-colors">
                                        {product.thumbnail ? (
                                            <Image
                                                src={product.thumbnail}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                                Görsel Yok
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        {product.categoryName && (
                                            <p className="text-xs text-muted-foreground">{product.categoryName}</p>
                                        )}
                                        {product.price && (
                                            <p className="text-sm font-semibold text-primary mt-2">{product.price} ₺</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {(page > 1 || hasNextPage) && (
                        <div className="mt-12 flex items-center justify-center space-x-4 border-t pt-8">
                            {page > 1 && (
                                <Link
                                    href={`/search?q=${q}&page=${page - 1}`}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                >
                                    Önceki Sayfa
                                </Link>
                            )}
                            {hasNextPage && (
                                <Link
                                    href={`/search?q=${q}&page=${page + 1}`}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm"
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
