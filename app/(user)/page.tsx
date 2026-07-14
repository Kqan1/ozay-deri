import { Suspense } from "react";
import {
    CarouselSkeleton,
    CategoriesSkeleton,
    HomeCarouselSection,
    NewProductsSection,
    ProductsSkeleton,
    TopCategoriesSection,
} from "@/components/home/home-sections";

export default function Home() {
    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section with Carousel */}
            <Suspense fallback={<CarouselSkeleton />}>
                <HomeCarouselSection />
            </Suspense>

            {/* Top Categories */}
            <Suspense fallback={<CategoriesSkeleton />}>
                <TopCategoriesSection />
            </Suspense>

            {/* New Arrivals */}
            <Suspense fallback={<ProductsSkeleton />}>
                <NewProductsSection />
            </Suspense>
        </div>
    );
}
