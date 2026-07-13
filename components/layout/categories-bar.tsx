import Link from "next/link";
import db from "@/lib/db";

export default async function CategoriesBar() {
    const categories = await db.category.findMany({
        where: { isHidden: false, parentId: null },
        orderBy: { name: "asc" },
    });

    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full border-b bg-card shadow-sm">
            <div className="mx-auto flex items-center overflow-x-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 scrollbar-hide justify-center-safe">
                <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
                >
                    Ana Sayfa
                </Link>
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/categories/${category.id}`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
                    >
                        {category.name}
                    </Link>
                ))}
                <Link
                    href="/contact"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
                >
                    İletişim
                </Link>
            </div>
        </div>
    );
}
