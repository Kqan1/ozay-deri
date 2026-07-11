import "./../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header-user";

import Providers from "@/components/providers/providers";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { fontSans } from "@/utils/fonts";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="tr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn("bg-background min-h-screen font-sans antialiased text-foreground", fontSans.variable)}
            >
                <Providers>
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-7xl w-full">{children}</div>
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
