"use client";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

export default function NextThemesProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange {...props}>
            {children}
        </ThemeProvider>
    );
}
