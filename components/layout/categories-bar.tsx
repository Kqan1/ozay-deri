import Link from "next/link";
import { getCachedCategoriesBar } from "@/lib/cached-queries";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default async function CategoriesBar() {
    const categories = await getCachedCategoriesBar();

    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full border-b bg-card shadow-sm">
            <div className="mx-auto flex justify-center max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
                <NavigationMenu>
                    <NavigationMenuList className="flex flex-wrap justify-center gap-1">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/" className={navigationMenuTriggerStyle()}>
                                    Ana Sayfa
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        
                        {categories.map((category) => (
                            <NavigationMenuItem key={category.id}>
                                {category.subcategories && category.subcategories.length > 0 ? (
                                    <>
                                        <NavigationMenuTrigger className="bg-transparent text-muted-foreground hover:text-foreground">
                                            {category.name}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                                                {category.subcategories.map((sub) => (
                                                    <li key={sub.id}>
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                href={`/categories/${sub.id}`}
                                                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                            >
                                                                <div className="text-sm font-medium leading-none">{sub.name}</div>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                                <li className="col-span-full mt-2">
                                                    <NavigationMenuLink asChild>
                                                        <Link
                                                            href={`/categories/${category.id}`}
                                                            className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors bg-secondary/50 hover:bg-secondary text-secondary-foreground text-center"
                                                        >
                                                            <div className="text-sm font-medium leading-none">{category.name} Kategorisine Git</div>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <NavigationMenuLink asChild>
                                        <Link href={`/categories/${category.id}`} className={`${navigationMenuTriggerStyle()} bg-transparent text-muted-foreground hover:text-foreground`}>
                                            {category.name}
                                        </Link>
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/contact" className={`${navigationMenuTriggerStyle()} bg-transparent text-muted-foreground hover:text-foreground`}>
                                    İletişim
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
