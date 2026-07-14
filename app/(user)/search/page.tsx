import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCatalogLayout from "@/components/shop/product-catalog-layout";
import { logEmptySearch } from "@/app/actions/search-actions";
import { Prisma } from "@/app/generated/prisma/client";
import db from "@/lib/db";
import { getFilterOptions, buildRawFilterConditions } from "@/lib/services/product-service";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const q = (resolvedParams.q as string) || "";
    const page = Number(resolvedParams.page) || 1;
    const categoryParam = resolvedParams.category as string | undefined;
    const sortParam = resolvedParams.sort as string | undefined;
    const categoryIds = categoryParam ? categoryParam.split(",") : [];

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

    // 3. Construct raw query safely using service
    let { filterConditions, filterKeys } = buildRawFilterConditions(activeFilters);

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
      p.images[1] as "firstImage",
      GREATEST(similarity(p.name, ${q}), COALESCE(similarity(c.name, ${q}), 0)) as "simScore"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE 1=1
    ${q ? Prisma.sql`AND (
       similarity(p.name, ${q}) > 0.1
       OR similarity(c.name, ${q}) > 0.1
       OR EXISTS (
          SELECT 1 FROM "ProductField" pf
          JOIN "FieldDefinition" fd ON pf.name = fd.name
          WHERE pf."productId" = p.id 
            AND fd."isSearchable" = true
            AND similarity(pf."stringValue", ${q}) > 0.1
       )
    )` : Prisma.empty}
    ${filterConditions}
    ${
        sortParam === "name_asc"
            ? Prisma.sql`ORDER BY p.name ASC`
            : sortParam === "name_desc"
            ? Prisma.sql`ORDER BY p.name DESC`
            : sortParam === "newest"
            ? Prisma.sql`ORDER BY p."createdAt" DESC`
            : q ? Prisma.sql`ORDER BY GREATEST(similarity(p.name, ${q}), COALESCE(similarity(c.name, ${q}), 0)) DESC` : Prisma.sql`ORDER BY p."createdAt" DESC`
    }
    LIMIT 12 OFFSET ${(page - 1) * 12}
  `;

    const results = (await db.$queryRaw(query)) as any[];

    if (results.length === 0 && page === 1 && filterKeys.length === 0) {
        await logEmptySearch(q);
    }

    // 4. Fetch possible values for filterable fields for Sidebar
    const filterOptions = await getFilterOptions(filterableFields);

    const countResult = await db.$queryRaw<{ count: string }[]>(Prisma.sql`
        SELECT COUNT(*)::text as count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        WHERE 1=1
        ${q ? Prisma.sql`AND (p.name ILIKE ${'%' + q + '%'} OR c.name ILIKE ${'%' + q + '%'})` : Prisma.empty}
        ${filterConditions}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || "0", 10);
    const totalPages = Math.ceil(totalCount / 12);

    const standardProducts = results.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.thumbnail || product.firstImage || null,
        categoryName: product.categoryName,
        description: product.description || "",
    }));

    return (
        <ProductCatalogLayout
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            products={standardProducts}
            filterOptions={filterOptions}
            categories={categories}
            emptyMessage="Ürün Bulunamadı"
            emptyDescription={q ? `"${q}" için arama kriterlerinize uyan bir ürün bulamadık. Lütfen farklı kelimelerle veya filtreleri temizleyerek tekrar deneyin.` : "Kriterlerinize uyan bir ürün bulunamadı."}
            headerChildren={
                <div className="flex items-center text-sm text-muted-foreground space-x-2">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Ana Sayfa
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-foreground">{q ? `"${q}" için sonuçlar` : "Tüm Ürünler"}</span>
                </div>
            }
        />
    );
}
