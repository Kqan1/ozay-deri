import Link from "next/link";
import { getServerSession } from "next-auth";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LiveSearch from "@/components/ui/live-search";
import { siteConfig } from "@/lib/config";
import db from "@/lib/db";
import MobileMenu from "./mobile-menu";
import MobileSearchButton from "./mobile-search-button";

export default async function HeaderUser() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === "ADMIN";

    const categories = await db.category.findMany({
        where: { isHidden: false, parentId: null },
        orderBy: { name: "asc" },
        include: {
            subcategories: {
                where: { isHidden: false },
                orderBy: { name: "asc" },
            },
        },
        take: 10,
    });

    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full h-16 border-b bg-card flex items-center justify-between shadow-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand name */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
                        Özay Deri
                    </Link>
                </div>

                {/* Search */}
                <div className="flex-1 flex justify-center max-w-2xl px-4">
                    <LiveSearch />
                </div>

                {/* Right Side Actions */}
                <nav className="flex items-center gap-2 sm:gap-4">
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                            Admin Paneli
                        </Link>
                    )}
                    <MobileSearchButton />
                    <MobileMenu categories={categories} isAdmin={isAdmin} />
                    <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                        {siteConfig.links.instagram && (
                            <Link
                                href={siteConfig.links.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 transition-colors rounded-md hover:bg-muted"
                            >
                                <FaInstagram className="w-5 h-5" />
                            </Link>
                        )}
                        {siteConfig.links.tiktok && (
                            <Link
                                href={siteConfig.links.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-foreground hover:opacity-80 transition-opacity rounded-md hover:bg-muted"
                            >
                                <FaTiktok className="w-5 h-5" />
                            </Link>
                        )}
                        {siteConfig.links.whatsapp && (
                            <Link
                                href={siteConfig.links.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors rounded-md hover:bg-muted"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
