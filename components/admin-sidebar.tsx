"use client";

import {
  Folders,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Panel (Dashboard)", href: "/admin", icon: LayoutDashboard },
    { name: "Ürünler", href: "/admin/products", icon: Package },
    { name: "Kategoriler", href: "/admin/categories", icon: Folders },
    { name: "Özel Alanlar", href: "/admin/fields", icon: Settings2 },
    { name: "Yöneticiler", href: "/admin/admins", icon: Shield },
  ];

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Link
          href="/"
          className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          Özay Deri{" "}
          <span className="text-primary font-normal text-sm ml-1">Admin</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          // Check if current path matches link href exactly, or if it's a subpath (but handle /admin carefully)
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname?.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t space-y-2">
        <Link
          href="/"
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Globe className="w-4 h-4" />
          Siteye Dön
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
