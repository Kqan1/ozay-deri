"use client";

import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/lib/config";

interface Category {
    id: string;
    name: string;
    subcategories?: { id: string; name: string }[];
}

interface MobileMenuProps {
    categories: Category[];
    isAdmin?: boolean;
}

function CategoryItem({ cat, onNavigate }: { cat: Category; onNavigate: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasSub = cat.subcategories && cat.subcategories.length > 0;

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <Link
                    href={`/categories/${cat.id}`}
                    onClick={onNavigate}
                    className={`text-lg font-medium hover:text-primary transition-colors py-2 ${!hasSub ? "flex-1" : "pr-4"}`}
                >
                    {cat.name}
                </Link>
                {hasSub && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex-1 flex justify-end items-center py-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {hasSub && isOpen && (
                <div className="flex flex-col gap-2 pl-4 mt-2 border-l-2 border-muted">
                    {cat.subcategories?.map((sub) => (
                        <Link
                            key={sub.id}
                            href={`/categories/${sub.id}`}
                            onClick={onNavigate}
                            className="text-base text-muted-foreground hover:text-primary transition-colors py-1"
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MobileMenu({ categories, isAdmin }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="md:hidden p-2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors">
                    <Menu className="w-6 h-6" />
                    <span className="sr-only">Menüyü aç</span>
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] overflow-y-auto p-6 sm:p-8 pb-20 !h-[calc(100dvh-2rem)] !m-4 rounded-3xl border shadow-2xl"
            >
                <SheetHeader className="mb-8 flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-left font-bold text-2xl tracking-tight">Özay Aksesuar</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-10">
                    {/* Hızlı Linkler */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                            Menü
                        </h4>
                        <div className="flex flex-col gap-3">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setOpen(false)}
                                    className="text-lg font-bold text-primary hover:opacity-80 transition-opacity py-1"
                                >
                                    Admin Paneli
                                </Link>
                            )}
                            {siteConfig.quickLinks.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="text-lg font-medium hover:text-primary transition-colors py-1"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Kategoriler */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                            Kategoriler
                        </h4>
                        <div className="flex flex-col gap-3">
                            {categories && categories.length > 0 ? (
                                categories.map((cat) => (
                                    <CategoryItem key={cat.id} cat={cat} onNavigate={() => setOpen(false)} />
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-dashed text-center">
                                    Henüz kategori bulunmuyor.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* İletişim */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                            İletişim
                        </h4>
                        <div className="flex items-center gap-4 mb-6">
                            {siteConfig.links.instagram && (
                                <Link
                                    href={siteConfig.links.instagram}
                                    target="_blank"
                                    className="text-muted-foreground hover:text-pink-600 transition-colors"
                                >
                                    <FaInstagram className="w-6 h-6" />
                                </Link>
                            )}
                            {siteConfig.links.tiktok && (
                                <Link
                                    href={siteConfig.links.tiktok}
                                    target="_blank"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <FaTiktok className="w-6 h-6" />
                                </Link>
                            )}
                            {siteConfig.links.whatsapp && (
                                <Link
                                    href={siteConfig.links.whatsapp}
                                    target="_blank"
                                    className="text-muted-foreground hover:text-green-600 transition-colors"
                                >
                                    <FaWhatsapp className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            {siteConfig.contact.phones.map((phone, idx) => (
                                <Link
                                    key={idx}
                                    href={`tel:${phone.value}`}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {phone.label}
                                </Link>
                            ))}
                            <Link
                                href={`mailto:${siteConfig.contact.email}`}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {siteConfig.contact.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
