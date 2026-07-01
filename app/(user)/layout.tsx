import "./../globals.css";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { fontSans } from "@/utils/fonts";
import { cn } from "@/lib/utils";

import Providers from "@/components/providers/providers";
import Header from "@/components/header-user";
import Footer from "@/components/footer";
import { Inter } from "next/font/google";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
            <body suppressHydrationWarning className={cn("bg-background h-full overflow-hidden font-sans antialiased text-foreground",fontSans.variable)}>
                <Providers>
                    <main className="flex h-full w-full justify-center">
                        <Header />
                        <div className="flex-1 overflow-y-auto p-4">
                            {children}
                        </div>
                        <Footer />
                    </main>
                </Providers>
            </body>
        </html>
    );
}
