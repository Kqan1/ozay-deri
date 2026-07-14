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
        include: {
            subcategories: {
                where: { isHidden: false },
                take: 5,
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 4,
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {topCategories.map((category) => (
                            <div key={category.id} className="bg-card text-card-foreground border rounded-xl shadow-sm hover:border-primary/50 transition-colors flex flex-col h-full overflow-hidden">
                                {/* Top: Title */}
                                <div className="px-4 pt-4 pb-2 text-center">
                                    <h3 className="text-xl font-semibold tracking-tight">
                                        {category.name}
                                    </h3>
                                </div>
                                
                                {/* Middle: Floating Image */}
                                <Link href={`/categories/${category.id}`} className="flex-1 relative min-h-[140px] w-full flex items-center justify-center group mb-4 px-4">
                                    {category.images && category.images.length > 0 ? (
                                        <ImageWithSpinner 
                                            src={category.images[0]} 
                                            alt={category.name} 
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md" 
                                        />
                                    ) : (
                                        <span className="text-muted-foreground text-sm">Görsel Yok</span>
                                    )}
                                </Link>

                                {/* Bottom: 2x3 Subcategory Grid (Always 2 columns) */}
                                <div className="grid grid-cols-2 gap-2 px-4 pb-4 pt-0 mt-auto">
                                    {category.subcategories.map((sub) => (
                                        <Link 
                                            key={sub.id} 
                                            href={`/categories/${sub.id}`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-2 line-clamp-1 transition-colors"
                                            title={sub.name}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                    {/* Hepsi (All) Button */}
                                    <Link 
                                        href={`/categories/${category.id}`}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-2 transition-colors"
                                    >
                                        Tümü <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
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
