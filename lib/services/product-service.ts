import db from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";

/**
 * Fetches distinct available options for filterable fields to render in the sidebar.
 */
export async function getFilterOptions(filterableFields: any[], categoryId?: string) {
    return await Promise.all(
        filterableFields.map(async (field) => {
            const distinctValues = await db.productField.findMany({
                where: {
                    name: field.name,
                    stringValue: { not: null },
                    ...(categoryId ? { product: { categoryId } } : {}),
                },
                distinct: ["stringValue"],
                select: { stringValue: true },
            });
            return {
                id: field.id,
                name: field.name,
                options: distinctValues.map((v) => v.stringValue).filter(Boolean) as string[],
            };
        })
    );
}

/**
 * Builds standard filter conditions for Prisma product queries.
 */
export function buildFilterConditions(filterableFields: any[], searchParams: any) {
    const filterConditions: any[] = [];
    for (const field of filterableFields) {
        if (field.name === "Alt Kategori") continue;
        const rawVal = searchParams[field.name];
        if (rawVal) {
            const activeValues = typeof rawVal === "string" ? rawVal.split(",") : rawVal;
            filterConditions.push({
                fields: {
                    some: {
                        name: field.name,
                        stringValue: { in: activeValues },
                    },
                },
            });
        }
    }
    return filterConditions;
}

/**
 * Builds raw SQL filter conditions for complex search queries.
 */
export function buildRawFilterConditions(activeFilters: Record<string, string[]>) {
    let filterConditions = Prisma.empty;
    const filterKeys = Object.keys(activeFilters).filter((k) => k !== "Alt Kategori");
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
    return { filterConditions, filterKeys };
}
