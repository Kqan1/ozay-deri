import "./../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/providers";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { fontSans } from "@/utils/fonts";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = siteConfig.metadata;

export default function AccountDeletedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="tr" className={cn("h-full", "font-sans", inter.variable)} suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn("bg-background min-h-screen font-sans antialiased text-foreground", fontSans.variable)}
            >
                <Providers>
                    <div className="flex min-h-screen bg-muted/30">
                        <main className="flex-1 flex items-center justify-center p-4">{children}</main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
