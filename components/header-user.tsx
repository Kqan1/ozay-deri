"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, User, LogIn, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HeaderUser() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.06] bg-black/60 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo / Brand name */}
                <div className="flex items-center">
                    <Link 
                        href="/" 
                        className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors"
                    >
                        ÖZAY Deri
                    </Link>
                </div>

                {/* Right Side Actions */}
                <nav className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="h-8 w-24 animate-pulse rounded-md bg-white/10" />
                    ) : session ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Admin Link if Admin */}
                            {session.user.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-2.5 py-1.5 rounded-full transition-all duration-200"
                                >
                                    <Shield size={14} />
                                    <span className="hidden sm:inline">Admin Panel</span>
                                </Link>
                            )}

                            {/* User Profile Info */}
                            <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/20 text-indigo-400">
                                    <User size={14} />
                                </div>
                                <span className="max-w-[100px] truncate font-medium text-xs sm:text-sm">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>

                            {/* Logout Action */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="flex items-center gap-1 text-xs sm:text-sm text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Çıkış</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-colors px-3 py-1.5"
                            >
                                <LogIn size={15} />
                                Giriş
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-600/15 transition-all active:scale-95"
                            >
                                <UserPlus size={15} />
                                Kayıt Ol
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}