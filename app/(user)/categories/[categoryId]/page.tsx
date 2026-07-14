import Link from "next/link";
import { notFound } from "next/navigation";
import SidebarFilter from "@/components/shop/sidebar-filter";
import MobileFilter from "@/components/shop/mobile-filter";
import SortDropdown from "@/components/shop/sort-dropdown";
import ProductGridLayout from "@/components/shop/product-grid-layout";
import ShopPagination from "@/components/shop/shop-pagination";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";
import db from "@/lib/db";

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ categoryId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;

    const categoryId = resolvedParams.categoryId;
    const page = Number(resolvedSearch.page) || 1;
    const sort = resolvedSearch.sort as string;
    const gridParam = resolvedSearch.grid as string || "4";

    const category = await db.category.findUnique({
        where: { id: categoryId },
        include: { subcategories: { where: { isHidden: false } } },
    });

    if (!category) {
        notFound();
    }

    // 1. Fetch filterable fields for this category or global
    const allCategories = await db.category.findMany({ select: { id: true, parentId: true } });
    const ancestorIds = new Set<string>();
    let currentId: string | null = category.parentId;
    while (currentId) {
        ancestorIds.add(currentId);
        const parent = allCategories.find((c) => c.id === currentId);
        currentId = parent ? parent.parentId : null;
    }

    const filterableFields = await db.fieldDefinition.findMany({
        where: {
            isFilterable: true,
            OR: [
                { isGlobal: true }, 
                { categoryId },
                { categoryId: { in: Array.from(ancestorIds) }, includeSubcategories: true }
            ],
        },
    });

    // 2. Build dynamic where conditions using Prisma ORM
    const filterConditions: any[] = [];

    for (const field of filterableFields) {
        const rawVal = resolvedSearch[field.name];
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

    // Handle Subcategory Filter
    const rawSubCat = resolvedSearch["Alt Kategori"];
    let targetCategoryIds = [categoryId, ...category.subcategories.map((s) => s.id)];

    if (rawSubCat) {
        const activeNames = typeof rawSubCat === "string" ? rawSubCat.split(",") : rawSubCat;
        const matchingSubCats = category.subcategories.filter((s) => activeNames.includes(s.name));
        if (matchingSubCats.length > 0) {
            targetCategoryIds = matchingSubCats.map((s) => s.id);
        }
    }

    // Handle Sort
    let orderBy: any = { createdAt: "desc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };

    // 3. Query products
    const products = await db.product.findMany({
        where: {
            categoryId: { in: targetCategoryIds },
            AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
        include: {
            fields: {
                where: {
                    name: { in: ["Thumbnail", "Açıklama", "Description"] }
                },
            },
        },
        orderBy,
        take: 12,
        skip: (page - 1) * 12,
    });

    const totalProducts = await db.product.count({
        where: {
            categoryId: { in: targetCategoryIds },
            AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
    });

    const totalPages = Math.ceil(totalProducts / 12);

    // 4. Fetch available distinct values for the sidebar filters
    const filterOptions = await Promise.all(
        filterableFields.map(async (field) => {
            const distinctValues = await db.productField.findMany({
                where: {
                    name: field.name,
                    stringValue: { not: null },
                    product: { categoryId },
                },
                distinct: ["stringValue"],
                select: { stringValue: true },
            });
            return {
                id: field.id,
                name: field.name,
                options: distinctValues.map((v) => v.stringValue).filter(Boolean) as string[],
            };
        }),
    );

    if (category.subcategories.length > 0) {
        filterOptions.unshift({
            id: "subcategories",
            name: "Alt Kategori",
            options: category.subcategories.map((s) => s.name),
        });
    }

    const standardProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.fields.find(f => f.name === "Thumbnail")?.stringValue || null,
        description: product.fields.find(f => f.name.toLowerCase().includes('açıklama') || f.name.toLowerCase().includes('description'))?.stringValue || "",
    }));

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{category.name}</h1>
                    <p className="text-muted-foreground mt-2">{totalProducts} ürün bulundu</p>
                </div>
            </div>

            {/* Subcategories Bar */}
            {category.subcategories.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground ml-1">Alt Kategoriler</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-4 scrollbar-hide">
                        {category.subcategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/categories/${sub.id}`}
                                className="px-5 py-2 bg-secondary/60 hover:bg-secondary rounded-full text-sm font-medium transition-colors whitespace-nowrap text-foreground"
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Mobile Filter & Sort Buttons */}
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="flex-1">
                        <MobileFilter filterableFields={filterOptions} />
                    </div>
                    <SortDropdown />
                </div>

                <aside className="hidden lg:block w-64 shrink-0">
                    <SidebarFilter filterableFields={filterOptions} />
                </aside>

                <ProductGridLayout 
                    products={standardProducts}
                    totalCount={totalProducts}
                    sortDropdown={<SortDropdown />}
                    emptyMessage="Ürün Bulunamadı"
                    emptyDescription="Seçtiğiniz filtrelere uygun ürün bulunmamaktadır."
                />
            </div>

            {/* Pagination */}
            <div className="mt-12 border-t pt-8">
                <ShopPagination page={page} totalPages={totalPages} />
            </div>
        </div>
    );
}
