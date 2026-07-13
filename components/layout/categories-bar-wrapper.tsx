"use client";

import { usePathname } from "next/navigation";

export default function CategoriesBarWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname !== "/") return null;

    return <>{children}</>;
}
