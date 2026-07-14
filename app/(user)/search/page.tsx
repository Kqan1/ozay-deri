import { ChevronRight } from "lucide-react";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import Link from "next/link";
import { logEmptySearch } from "@/app/actions/search-actions";
import { Prisma } from "@/app/generated/prisma/client";
import SidebarFilter from "@/components/shop/sidebar-filter";
import MobileFilter from "@/components/shop/mobile-filter";
import SortDropdown from "@/components/shop/sort-dropdown";
import ProductGridLayout from "@/components/shop/product-grid-layout";
import ShopPagination from "@/components/shop/shop-pagination";
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
    const sortParam = resolvedParams.sort as string | undefined;
    const gridParam = resolvedParams.grid as string | undefined;
    const categoryIds = categoryParam ? categoryParam.split(",") : [];

    if (!q) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <h2 className="text-2xl font-semibold mb-2">Arama</h2>
                <p className="text-neutral-400">Lütfen aramak istediğiniz kelimeyi giriniz.</p>
            </div>
        );
    }

    const categories = await db.category.findMany({
        where: { isHidden: false },
        select: { id: true, name: true, parentId: true },
    });

    const ancestorIds = new Set<string>();
    for (const catId of categoryIds) {
        let currentId: string | null = catId;
        while (currentId) {
            const cat = categories.find((c) => c.id === currentId);
            if (!cat || !cat.parentId) break;
            ancestorIds.add(cat.parentId);
            currentId = cat.parentId;
        }
    }

    // 1. Find all filterable fields globally, for selected category, or inherited from ancestors
    const filterableFields = await db.fieldDefinition.findMany({
        where: {
            isFilterable: true,
            ...(categoryIds.length > 0
                ? {
                      OR: [
                          { isGlobal: true },
                          { categoryId: { in: categoryIds } },
                          { categoryId: { in: Array.from(ancestorIds) }, includeSubcategories: true },
                      ],
                  }
                : {}),
        },
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
      (
        SELECT "stringValue" 
        FROM "ProductField" pf 
        WHERE pf."productId" = p.id AND pf.name IN ('Açıklama', 'Description')
        LIMIT 1
      ) as description,
      c.name as "categoryName",
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
    ${
        sortParam === "name_asc"
            ? Prisma.sql`ORDER BY p.name ASC`
            : sortParam === "name_desc"
            ? Prisma.sql`ORDER BY p.name DESC`
            : sortParam === "newest"
            ? Prisma.sql`ORDER BY p."createdAt" DESC`
            : Prisma.sql`ORDER BY GREATEST(similarity(p.name, ${q}), COALESCE(similarity(c.name, ${q}), 0)) DESC`
    }
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

    const searchCondition = {
        OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { category: { name: { contains: q, mode: 'insensitive' as const } } }
        ]
    };
    
    const countResult = await db.$queryRaw<{ count: string }[]>(Prisma.sql`
        SELECT COUNT(*)::text as count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE (
            p.name ILIKE ${'%' + q + '%'} OR c.name ILIKE ${'%' + q + '%'}
        )
        ${filterConditions}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || "0", 10);
    const totalPages = Math.ceil(totalCount / 12);

    const standardProducts = results.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.thumbnail || null,
        categoryName: product.categoryName,
        description: product.description || "",
    }));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center text-sm text-muted-foreground space-x-2">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Ana Sayfa
                </Link>
                <ChevronRight size={14} />
                <span className="text-foreground">"{q}" için sonuçlar</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Mobile Filter & Sort Buttons */}
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="flex-1">
                        <MobileFilter filterableFields={filterOptions} categories={categories} />
                    </div>
                    <SortDropdown />
                </div>

                {/* Left Sidebar (Filters) for Desktop */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <SidebarFilter filterableFields={filterOptions} categories={categories} />
                </aside>

                {/* Main Content (Results) */}
                <ProductGridLayout 
                    products={standardProducts}
                    totalCount={totalCount}
                    sortDropdown={<SortDropdown />}
                    emptyMessage="Sonuç Bulunamadı"
                    emptyDescription={`"${q}" için arama kriterlerinize uyan bir ürün bulamadık. Lütfen farklı kelimelerle veya filtreleri temizleyerek tekrar deneyin.`}
                />
            </div>

            {/* Pagination */}
            <div className="mt-12 border-t pt-8">
                <ShopPagination page={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
