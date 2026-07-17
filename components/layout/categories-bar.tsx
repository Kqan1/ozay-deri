import Link from "next/link";
import { ChevronRight, ArrowRight, LayoutGrid } from "lucide-react";
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
                            <NavigationMenuLink render={<Link href="/" className={navigationMenuTriggerStyle()} />}>
                                Ana Sayfa
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
                                            <ul className="grid w-[320px] gap-2 p-3 md:w-[450px] md:grid-cols-2 lg:w-[600px] bg-background/95 backdrop-blur-md rounded-xl border shadow-lg">
                                                {category.subcategories.map((sub) => (
                                                    <li key={sub.id}>
                                                        <NavigationMenuLink render={
                                                            <Link
                                                                href={`/categories/${sub.id}`}
                                                                className="group flex items-center justify-between rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-border/50 relative overflow-hidden"
                                                            />
                                                        }>
                                                            <div className="flex items-center gap-3 relative z-10">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                                                    <LayoutGrid className="w-4 h-4" />
                                                                </div>
                                                                <div className="text-sm font-medium leading-tight">{sub.name}</div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10" />
                                                        </NavigationMenuLink>
                                                    </li>
                                                ))}
                                                <li className="col-span-full mt-2 pt-2 border-t">
                                                    <NavigationMenuLink render={
                                                        <Link
                                                            href={`/categories/${category.id}`}
                                                            className="group flex items-center justify-center gap-2 select-none rounded-lg p-3.5 leading-none no-underline outline-none transition-all duration-300 bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-primary/10 hover:to-primary/5 text-foreground text-center shadow-sm hover:shadow border border-border/50 hover:border-primary/20"
                                                        />
                                                    }>
                                                        <div className="text-sm font-semibold tracking-wide">{category.name} Kategorisine Git</div>
                                                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                                                    </NavigationMenuLink>
                                                </li>
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <NavigationMenuLink render={<Link href={`/categories/${category.id}`} className={`${navigationMenuTriggerStyle()} bg-transparent text-muted-foreground hover:text-foreground`} />}>
                                        {category.name}
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}

                        <NavigationMenuItem>
                            <NavigationMenuLink render={<Link href="/contact" className={`${navigationMenuTriggerStyle()} bg-transparent text-muted-foreground hover:text-foreground`} />}>
                                İletişim
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
