import "./../globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/components/providers/providers";
import { fontSans } from "@/utils/fonts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="tr" className={cn("h-full", fontSans.variable)} suppressHydrationWarning>
            <body suppressHydrationWarning className={cn("h-full font-sans antialiased bg-black text-white", fontSans.variable)}>
                <Providers>
                    <div className="relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden">
                        {/* Background glowing blobs for premium feel */}
                        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-900 rounded-full filter blur-[128px] opacity-30 animate-pulse pointer-events-none" />
                        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-rose-900 rounded-full filter blur-[128px] opacity-35 animate-pulse pointer-events-none" />
                        
                        {/* Smooth mesh background overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black opacity-90 pointer-events-none" />
                        
                        {/* Page content wrapper */}
                        <div className="relative z-10 w-full max-w-md">
                            {children}
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
