import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import db from "@/lib/db";
import { HeroCarousel } from "@/components/shop/hero-carousel";

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

    // Mock slides for the carousel since we don't have banner data in DB
    const slides = [
        {
            title: "Özay Deri'ye Hoş Geldiniz",
            description: "En kaliteli deri ürünleri, çantalar ve aksesuarlar ile tarzınızı yansıtın. Yeni sezon koleksiyonunu hemen keşfedin.",
            link: "/search?q=",
            cta: "Alışverişe Başla"
        },
        {
            title: "Yeni Sezon Çantalar",
            description: "Şıklığı ve zarafeti bir araya getiren yeni sezon kadın çantalarını keşfedin.",
            link: "/search?q=çanta",
            cta: "Çantaları İncele"
        },
        {
            title: "Hakiki Deri Cüzdanlar",
            description: "Uzun ömürlü kullanım ve prestijli görünüm arayanlar için özel tasarım deri cüzdanlar.",
            link: "/search?q=cüzdan",
            cta: "Cüzdanları İncele"
        }
    ];

    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section with Carousel */}
            <section className="relative w-full">
                <HeroCarousel slides={slides} />
            </section>

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
                                <div className="h-48 w-full bg-card border rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <span className="text-sm text-muted-foreground mt-2 group-hover:underline">
                                        İncele
                                    </span>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {newProducts.map((product) => {
                            const thumbnail = product.fields[0]?.stringValue;

                            return (
                                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                                    <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-card border group-hover:border-primary/50 transition-colors">
                                        {thumbnail ? (
                                            <Image
                                                src={thumbnail}
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
                                        {product.category?.name && (
                                            <p className="text-xs text-muted-foreground">{product.category.name}</p>
                                        )}
                                        {product.price && (
                                            <p className="text-sm font-semibold text-primary mt-2">{product.price} ₺</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
