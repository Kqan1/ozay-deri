import Link from "next/link";
import { getServerSession } from "next-auth";
import {
    FaEnvelope,
    FaInstagram,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaTiktok,
    FaWhatsapp,
} from "react-icons/fa";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/lib/config";
import db from "@/lib/db";
import MapIframe from "@/components/ui/map-iframe";

export default async function Footer() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user && (session.user as any).role === "ADMIN";

    const categories = await db.category.findMany({
        where: { isHidden: false, parentId: null },
        orderBy: { name: "asc" },
        take: 6,
    });

    return (
        <footer className="w-full border-t bg-card mt-auto pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
                    {/* Hızlı Linkler */}
                    <div className="md:col-span-6 lg:col-span-3">
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">HIZLI LİNKLER</h3>
                        <ul className="space-y-3">
                            {isAdmin && (
                                <li>
                                    <Link
                                        href="/admin"
                                        className="text-sm font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-2"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                                        Admin Paneli
                                    </Link>
                                </li>
                            )}
                            {siteConfig.quickLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kategoriler */}
                    <div className="md:col-span-6 lg:col-span-3">
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">KATEGORİLER</h3>
                        <ul className="space-y-3">
                            {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/categories/${category.id}`}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                            {category.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-muted-foreground italic">Henüz kategori eklenmemiş.</li>
                            )}
                        </ul>
                    </div>

                    {/* İletişim Bilgileri ve Harita */}
                    <div className="md:col-span-12 lg:col-span-6">
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">İLETİŞİM</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <ul className="space-y-5">
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <FaMapMarkerAlt className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-muted-foreground pt-1 leading-relaxed whitespace-pre-wrap">
                                        {siteConfig.contact.address}
                                    </span>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <FaPhoneAlt className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1">
                                        {siteConfig.contact.phones.map((phone, idx) => (
                                            <Link
                                                key={idx}
                                                href={`tel:${phone.value}`}
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {phone.label}
                                            </Link>
                                        ))}
                                    </div>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                        <FaEnvelope className="w-4 h-4" />
                                    </div>
                                    <Link
                                        href={`mailto:${siteConfig.contact.email}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                                    >
                                        {siteConfig.contact.email}
                                    </Link>
                                </li>
                            </ul>

                            <div className="w-full h-48 md:h-[220px] rounded-lg overflow-hidden border bg-muted -mt-2 md:mt-0 relative group">
                                {/* Clickable overlay to open map without trapping scroll */}
                                <a
                                    href={siteConfig.contact.mapIframeUrl.replace("&output=embed", "")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 md:bg-black/0 md:group-hover:bg-black/20 transition-all duration-300"
                                    title="Google Haritalar'da Aç"
                                >
                                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-background text-foreground px-4 py-2 rounded-md font-medium text-sm shadow-lg transition-opacity duration-300 flex items-center gap-2">
                                        <FaMapMarkerAlt className="w-4 h-4 text-primary" />
                                        Haritada Aç
                                    </div>
                                </a>
                                <MapIframe src={siteConfig.contact.mapIframeUrl} iframeClassName="pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alt Kısım */}
                <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 order-3 md:order-1 flex-col md:flex-row">
                        <ThemeToggle />
                        <p className="text-sm text-muted-foreground text-center md:text-left">
                            &copy; {new Date().getFullYear()} ÖZAY Deri / ÖZAY Leather Design. Tüm Hakları Saklıdır.
                        </p>
                    </div>

                    {/* Sosyal Medya */}
                    <div className="flex items-center justify-center gap-2 order-2">
                        {siteConfig.links.instagram && (
                            <Link
                                href={siteConfig.links.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 transition-colors rounded-md hover:bg-muted"
                            >
                                <FaInstagram className="w-5 h-5" />
                            </Link>
                        )}
                        {siteConfig.links.tiktok && (
                            <Link
                                href={siteConfig.links.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-foreground hover:opacity-80 transition-opacity rounded-md hover:bg-muted"
                            >
                                <FaTiktok className="w-5 h-5" />
                            </Link>
                        )}
                        {siteConfig.links.whatsapp && (
                            <Link
                                href={siteConfig.links.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors rounded-md hover:bg-muted"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                            </Link>
                        )}
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center text-sm text-muted-foreground order-1 md:order-3">
                        <Link
                            href="/"
                            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity text-foreground"
                        >
                            Özay Deri
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
