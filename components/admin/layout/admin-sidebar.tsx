"use client";

import { Folders, Globe, Image as ImageIcon, LayoutDashboard, LogOut, Package, Settings2, Shield } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAdminMenu } from "@/components/admin/layout/admin-mobile-menu-context";
import { cn } from "@/lib/utils";
import pkg from "../../../package.json";

export function AdminSidebar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useAdminMenu();

    const links = [
        {
            name: "Panel (Dashboard)",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            name: "Ürünler",
            href: "/admin/products",
            icon: Package,
        },
        {
            name: "Kategoriler",
            href: "/admin/categories",
            icon: Folders,
        },
        {
            name: "Carousel Yönetimi",
            href: "/admin/carousel",
            icon: ImageIcon,
        },
        {
            name: "Özel Alanlar",
            href: "/admin/fields",
            icon: Settings2,
        },
        {
            name: "Yöneticiler",
            href: "/admin/admins",
            icon: Shield,
        },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="py-6 flex flex-col items-center justify-center px-4 border-b gap-2">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex flex-col items-center gap-2">
                        <SafeImage src="/logo.png" alt="Özay Aksesuar" width={200} height={200} className="h-20 w-auto object-contain dark:invert" priority />
                        <span className="text-primary font-medium text-sm">Admin Paneli</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        // Check if current path matches link href exactly, or if it's a subpath (but handle /admin carefully)
                        const isActive =
                            pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto px-4 pb-3 flex justify-center">
                    <span className="text-[10px] font-mono text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                        v{pkg.version}
                    </span>
                </div>

                <div className="p-4 border-t space-y-2">
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        Siteye Dön
                    </Link>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>
        </>
    );
}
