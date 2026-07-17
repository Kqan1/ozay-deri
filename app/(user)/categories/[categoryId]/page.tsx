import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCatalogLayout from "@/components/shop/product-catalog-layout";
import { 
    getCachedCategory, 
    getCachedAllCategoriesLight, 
    getCachedFilterableFields, 
    getCachedCategoryProducts, 
    getCachedCategoryProductsCount 
} from "@/lib/cached-queries";
import { getFilterOptions, buildFilterConditions } from "@/lib/services/product-service";

export async function generateMetadata(
    { params }: { params: Promise<{ categoryId: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const category = await getCachedCategory(resolvedParams.categoryId);

    if (!category) {
        return {
            title: "Kategori Bulunamadı",
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: category.name,
        description: `${category.name} kategorisindeki ürünleri inceleyin. ÖZAY Aksesuar'da en uygun fiyatlarla.`,
        openGraph: {
            title: `${category.name} | ÖZAY Aksesuar`,
            description: `${category.name} kategorisindeki ürünleri inceleyin.`,
            url: `https://özayderiaksesuar.com/categories/${category.id}`,
            images: category.images && category.images.length > 0 ? [category.images[0], ...previousImages] : previousImages,
        },
    };
}

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

    const category = await getCachedCategory(categoryId);

    if (!category) {
        notFound();
    }

    // 1. Fetch filterable fields for this category or global
    const allCategories = await getCachedAllCategoriesLight();
    const ancestorIds = new Set<string>();
    let currentId: string | null = category.parentId;
    while (currentId) {
        ancestorIds.add(currentId);
        const parent = allCategories.find((c) => c.id === currentId);
        currentId = parent ? parent.parentId : null;
    }

    const filterableFields = await getCachedFilterableFields(categoryId, Array.from(ancestorIds));

    // 2. Build dynamic where conditions using service
    const filterConditions = buildFilterConditions(filterableFields, resolvedSearch);

    // Handle Subcategory Filter (Now using standard "category" param with infinite depth)
    const getDescendants = (id: string): string[] => {
        const children = allCategories.filter((c) => c.parentId === id).map((c) => c.id);
        let all = [...children];
        for (const child of children) {
            all = [...all, ...getDescendants(child)];
        }
        return all;
    };

    const allDescendantIds = getDescendants(categoryId);
    let targetCategoryIds = [categoryId, ...allDescendantIds];

    const categoryParam = resolvedSearch["category"];
    if (categoryParam) {
        const activeIds = typeof categoryParam === "string" ? categoryParam.split(",") : categoryParam;
        
        // Sadece bulunduğumuz kategorinin geçerli alt dallarını veya kendisini filtrelemeye izin ver
        const validActiveIds = activeIds.filter(id => allDescendantIds.includes(id) || id === categoryId);
        
        if (validActiveIds.length > 0) {
            targetCategoryIds = [];
            for (const activeId of validActiveIds) {
                targetCategoryIds.push(activeId, ...getDescendants(activeId));
            }
            // Duplicate'leri temizle (örneğin hem ana kategori hem alt kategori seçildiyse)
            targetCategoryIds = Array.from(new Set(targetCategoryIds));
        }
    }

    // Handle Sort
    let orderBy: any = { createdAt: "desc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };

    // 3. Query products
    const products = await getCachedCategoryProducts(
        targetCategoryIds,
        filterConditions,
        orderBy,
        12,
        (page - 1) * 12
    );

    const totalProducts = await getCachedCategoryProductsCount(targetCategoryIds, filterConditions);

    const totalPages = Math.ceil(totalProducts / 12);

    // 4. Fetch available distinct values for the sidebar filters
    const filterOptions = await getFilterOptions(filterableFields, categoryId);

    // Build the infinite category tree subset for this category's sidebar
    const validSidebarIds = [categoryId, ...allDescendantIds];
    const sidebarCategories = allCategories.filter(c => validSidebarIds.includes(c.id));

    const standardProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.fields.find(f => f.name === "Thumbnail")?.stringValue || (product.images && product.images.length > 0 ? product.images[0] : null),
        description: product.fields.find(f => f.name.toLowerCase().includes('açıklama') || f.name.toLowerCase().includes('description'))?.stringValue || "",
    }));

    return (
        <ProductCatalogLayout
            title={category.name}
            subtitle={`${totalProducts} ürün bulundu`}
            totalCount={totalProducts}
            page={page}
            totalPages={totalPages}
            products={standardProducts}
            filterOptions={filterOptions}
            categories={sidebarCategories}
            headerChildren={
                category.subcategories.length > 0 ? (
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
                ) : null
            }
        />
    );
}
