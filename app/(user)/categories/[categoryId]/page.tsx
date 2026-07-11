import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SidebarFilter from "@/components/shop/sidebar-filter";
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

    const category = await db.category.findUnique({
        where: { id: categoryId },
    });

    if (!category) {
        notFound();
    }

    // 1. Fetch filterable fields for this category or global
    const filterableFields = await db.fieldDefinition.findMany({
        where: {
            isFilterable: true,
            OR: [{ isGlobal: true }, { categoryId }],
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

    // Handle Sort
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    // 3. Query products
    const products = await db.product.findMany({
        where: {
            categoryId,
            AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
        include: {
            fields: {
                where: {
                    name: "Thumbnail",
                },
            },
        },
        orderBy,
        take: 12,
        skip: (page - 1) * 12,
    });

    const totalProducts = await db.product.count({
        where: {
            categoryId,
            AND: filterConditions.length > 0 ? filterConditions : undefined,
        },
    });

    const hasNextPage = totalProducts > page * 12;

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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{category.name}</h1>
                    <p className="text-muted-foreground mt-2">{totalProducts} ürün bulundu</p>
                </div>

                {/* Sort Select */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Sırala:</span>
                    <div className="relative">
                        <Link
                            href={`/categories/${categoryId}?sort=newest`}
                            className="text-sm text-foreground px-2 hover:text-primary transition-colors"
                        >
                            En Yeniler
                        </Link>
                        <Link
                            href={`/categories/${categoryId}?sort=price_asc`}
                            className="text-sm text-foreground px-2 border-l hover:text-primary transition-colors"
                        >
                            Fiyat (Artan)
                        </Link>
                        <Link
                            href={`/categories/${categoryId}?sort=price_desc`}
                            className="text-sm text-foreground px-2 border-l hover:text-primary transition-colors"
                        >
                            Fiyat (Azalan)
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <aside className="w-full lg:w-64 shrink-0">
                    <SidebarFilter filterableFields={filterOptions} />
                </aside>

                <main className="flex-1">
                    {products.length === 0 ? (
                        <div className="text-center py-20 bg-muted/50 border rounded-xl">
                            <h3 className="text-xl font-medium mb-2 text-foreground">Ürün Bulunamadı</h3>
                            <p className="text-muted-foreground text-sm">
                                Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                                    <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-card border group-hover:border-primary/50 transition-colors">
                                        {product.fields[0]?.stringValue ? (
                                            <Image
                                                src={product.fields[0].stringValue}
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
                                    href={`/categories/${categoryId}?page=${page - 1}`}
                                    className="px-4 py-2 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                                >
                                    Önceki Sayfa
                                </Link>
                            )}
                            {hasNextPage && (
                                <Link
                                    href={`/categories/${categoryId}?page=${page + 1}`}
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
