import { ArrowRight } from "lucide-react";
import Link from "next/link";
import ProductModalLink from "@/components/shop/product-modal-link";
import db from "@/lib/db";
import { HeroCarousel } from "@/components/shop/hero-carousel";
import { ImageWithSpinner } from "@/components/ui/image-with-spinner";

export default async function Home() {
    // 1. Fetch Top-Level Categories (parentId is null)
    const topCategories = await db.category.findMany({
        where: {
            isHidden: false,
            parentId: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 4, // limit to 4 to show nicely as cards
    });

    // 2. Fetch Newest Products
    const newProducts = await db.product.findMany({
        where: {
            isHidden: false,
        },
        include: {
            fields: {
                where: {
                    name: "Thumbnail",
                },
            },
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 8,
    });

    // Fetch Carousel Slides
    const slides = await db.carouselSlide.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" }
    });

    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section with Carousel */}
            {slides.length > 0 && (
                <section className="relative w-full">
                    <HeroCarousel slides={slides} />
                </section>
            )}

            {/* Top Categories */}
            {topCategories.length > 0 && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Kategoriler</h2>
                        <Link
                            href="/search?q="
                            className="text-sm font-medium text-primary hover:underline flex items-center"
                        >
                            Tümünü Gör <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {topCategories.map((category) => (
                            <Link key={category.id} href={`/categories/${category.id}`} className="group block">
                                <div className="relative h-48 w-full bg-card border rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 transition-colors shadow-sm hover:shadow-md group">
                                    {category.images && category.images.length > 0 && (
                                        <>
                                            <ImageWithSpinner 
                                                src={category.images[0]} 
                                                alt={category.name} 
                                                className="z-0 group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 z-0 group-hover:bg-black/50 transition-colors pointer-events-none"></div>
                                        </>
                                    )}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <h3 className={`text-xl font-bold transition-colors ${category.images && category.images.length > 0 ? "text-white" : "text-foreground group-hover:text-primary"}`}>
                                            {category.name}
                                        </h3>
                                        <span className={`text-sm mt-2 group-hover:underline ${category.images && category.images.length > 0 ? "text-gray-200" : "text-muted-foreground"}`}>
                                            İncele
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* New Arrivals */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-2xl font-bold tracking-tight">En Yeni Ürünler</h2>
                </div>

                {newProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-xl border">
                        Henüz ürün eklenmemiş.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {newProducts.map((product) => {
                            const thumbnail = product.fields[0]?.stringValue;

                            return (
                                <ProductModalLink key={product.id} productId={product.id} className="group block">
                                    <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-card border group-hover:border-primary/50 transition-colors">
                                        {thumbnail ? (
                                            <ImageWithSpinner
                                                src={thumbnail}
                                                alt={product.name}
                                                className="group-hover:scale-105 transition-transform duration-500"
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
                                        {product.category?.name && (
                                            <p className="text-xs text-muted-foreground">{product.category.name}</p>
                                        )}
                                    </div>
                                </ProductModalLink>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
