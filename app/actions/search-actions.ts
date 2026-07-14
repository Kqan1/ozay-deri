"use server";

import db from "@/lib/db";

export async function getLiveSearchSuggestions(query: string) {
    if (!query || query.length < 2) return [];

    // Fuzzy search using pg_trgm similarity
    // We search in Product name, Category name, and searchable ProductFields
    const results = (await db.$queryRaw`
    SELECT 
      p.id, 
      p.name, 
      c.name as "categoryName",
      (
        SELECT "stringValue" 
        FROM "ProductField" pf 
        WHERE pf."productId" = p.id AND pf.name = 'Thumbnail'
        LIMIT 1
      ) as thumbnail,
      p.images[1] as "firstImage",
      GREATEST(
        similarity(p.name, ${query}),
        COALESCE(similarity(c.name, ${query}), 0)
      ) as "simScore"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE 
       similarity(p.name, ${query}) > 0.1
       OR similarity(c.name, ${query}) > 0.1
       OR EXISTS (
          SELECT 1 FROM "ProductField" pf
          JOIN "FieldDefinition" fd ON pf.name = fd.name
          WHERE pf."productId" = p.id 
            AND fd."isSearchable" = true
            AND similarity(pf."stringValue", ${query}) > 0.1
       )
    ORDER BY "simScore" DESC
    LIMIT 5
  `) as any[];

    console.log(
        `[Live Search] Query: "${query}" | Results:`,
        results.map((r: any) => ({ name: r.name, simScore: r.simScore })),
    );

    return results;
}

export async function logEmptySearch(term: string) {
    if (!term) return;
    try {
        await db.searchLog.create({
            data: { term },
        });
    } catch (e) {
        console.error("Failed to log empty search", e);
    }
}
