import "./../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdminMenuProvider } from "@/components/admin/layout/admin-mobile-menu-context";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import HeaderAdmin from "@/components/admin/layout/header-admin";

import Providers from "@/components/providers/providers";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { fontSans } from "@/utils/fonts";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

import { requireAdmin } from "@/lib/auth-utils";

export const metadata: Metadata = siteConfig.metadata;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    await requireAdmin();
    return (
        <html lang="tr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn("bg-background min-h-screen font-sans antialiased text-foreground", fontSans.variable)}
            >
                <Providers>
                    <AdminMenuProvider>
                        <div className="flex min-h-screen">
                            <AdminSidebar />
                            <div className="flex-1 flex flex-col min-w-0">
                                <HeaderAdmin />
                                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                                    <div className="mx-auto max-w-7xl w-full">{children}</div>
                                </main>
                            </div>
                        </div>
                    </AdminMenuProvider>
                </Providers>
            </body>
        </html>
    );
}
