import "./../globals.css";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { fontSans } from "@/utils/fonts";
import { cn } from "@/lib/utils";

import Providers from "@/components/providers/providers";
import Header from "@/components/header-admin";
import Footer from "@/components/footer";
import { Inter } from "next/font/google";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
            <body suppressHydrationWarning className={cn("bg-background min-h-screen font-sans antialiased text-foreground",fontSans.variable)}>
                <Providers>
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-7xl w-full">
                                {children}
                            </div>
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
