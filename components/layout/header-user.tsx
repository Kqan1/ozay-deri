"use client";

import { Heart, LogIn, LogOut, Shield, ShoppingCart, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import LiveSearch from "@/components/ui/live-search";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HeaderUser() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const router = useRouter();

    React.useEffect(() => {
        if ((session as any)?.error === "UserDeleted") {
            router.push("/account-deleted");
        }
    }, [session, router]);

    const username = session?.user ? session.user.username || "Kullanıcı" : "";
    const initial = username ? username.charAt(0).toUpperCase() : "U";

    return (
        <header className="sticky top-0 left-0 right-0 z-50 w-full h-16 border-b bg-card flex items-center justify-between shadow-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand name */}
                <div className="flex items-center">
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
                    <ThemeToggle />
                    {isLoading ? (
                        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Admin Link if Admin */}
                            {session.user.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="hidden md:flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                    <Shield size={14} />
                                    <span>Yönetim Paneli</span>
                                </Link>
                            )}

                            {/* Quick Actions (Cart, Favorites etc.) */}
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <ShoppingCart className="w-5 h-5" />
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="text-xs font-bold">{initial}</span>
                                        </div>
                                        <span className="hidden sm:inline-block mr-1">{username}</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center w-full cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profilim</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            <span>Siparişlerim</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Heart className="mr-2 h-4 w-4" />
                                            <span>Favorilerim</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Çıkış Yap</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">Giriş Yap</span>
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow-sm transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Kayıt Ol</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
