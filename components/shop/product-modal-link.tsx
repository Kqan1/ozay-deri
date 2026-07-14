"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

interface ProductModalLinkProps {
    productId: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function ProductModalLink({ productId, children, className, onClick }: ProductModalLinkProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Prevent default navigation to avoid server trip
        e.preventDefault();

        if (onClick) {
            onClick();
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set("productId", productId);

        // Update URL shallowly without triggering a Next.js server re-render
        window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    };

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("productId", productId);
    const href = `${pathname || "/"}?${params.toString()}`;

    return (
        <Link href={href} scroll={false} onClick={handleClick} className={className}>
            {children}
        </Link>
    );
}
