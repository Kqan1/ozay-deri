"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Menu, LogOut, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function HeaderAdmin() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Dictionary for Turkish translations
    const breadcrumbDictionary: Record<string, string> = {
        "admin": "Yönetim Paneli",
        "products": "Ürünler",
        "categories": "Kategoriler",
        "fields": "Özel Alanlar"
    };

    // Generate breadcrumbs based on pathname
    const getBreadcrumbs = () => {
        if (!pathname) return [];
        const paths = pathname.split("/").filter(Boolean);
        return paths.map((path, index) => {
            const href = "/" + paths.slice(0, index + 1).join("/");
            const label = breadcrumbDictionary[path.toLowerCase()] || (path.charAt(0).toUpperCase() + path.slice(1));
            return { label, href, isLast: index === paths.length - 1 };
        });
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Menüyü Aç</span>
                </button>
                
                {/* Breadcrumbs (Shadcn UI) */}
                <div className="hidden sm:flex">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.href}>
                                    <BreadcrumbItem>
                                        {crumb.isLast ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={crumb.href}>{crumb.label}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!crumb.isLast && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="hidden sm:inline-block mr-1">
                                {(session?.user as any)?.username || "Yönetici"}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/profile" className="flex items-center w-full cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Ayarlar</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Çıkış Yap</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}