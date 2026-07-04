"use client";

import NextThemesProvider from "@/components/providers/next-themes-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode; }) {
    return (
        <SessionProvider>
            <NextThemesProvider>
                { children }
                <Toaster richColors position="bottom-right" />
            </NextThemesProvider>
        </SessionProvider>
    );
};