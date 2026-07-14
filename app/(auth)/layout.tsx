import "./../globals.css";
import Link from "next/link";
import Providers from "@/components/providers/providers";
import { cn } from "@/lib/utils";
import { fontSans } from "@/utils/fonts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" className={cn("h-full", fontSans.variable)} suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn("h-full font-sans antialiased bg-background text-foreground", fontSans.variable)}
            >
                <Providers>
                    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-muted/30">
                        {/* Logo Link to Home */}
                        <div className="mb-8">
                            <Link
                                href="/"
                                className="text-3xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                            >
                                Özay Aksesuar
                            </Link>
                        </div>

                        {/* Page content wrapper */}
                        <div className="w-full max-w-md">{children}</div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
