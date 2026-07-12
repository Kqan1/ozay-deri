import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { siteConfig } from "@/lib/config";
import db from "@/lib/db";

export default async function Footer() {
    const categories = await db.category.findMany({
        where: { isHidden: false, parentId: null },
        orderBy: { name: "asc" },
        take: 6,
    });

    return (
        <footer className="w-full border-t bg-card mt-auto pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
                    {/* Kurumsal / Hakkımızda */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">ÖZAY DERİ</h3>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Özay Deri & Aksesuar; bileklik aksesuarları, iplik çeşitleri, makrome ipleri ve hakiki deri çeşitleriyle kaliteli ürünleri sizlerle buluşturuyor.
                        </p>
                        <div className="flex items-center gap-4">
                            {siteConfig.links.instagram && (
                                <Link href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-pink-600 hover:text-white transition-all duration-300">
                                    <FaInstagram className="w-4 h-4" />
                                </Link>
                            )}
                            {siteConfig.links.facebook && (
                                <Link href={siteConfig.links.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white transition-all duration-300">
                                    <FaFacebook className="w-4 h-4" />
                                </Link>
                            )}
                            {siteConfig.links.twitter && (
                                <Link href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-sky-500 hover:text-white transition-all duration-300">
                                    <FaTwitter className="w-4 h-4" />
                                </Link>
                            )}
                            {siteConfig.links.youtube && (
                                <Link href={siteConfig.links.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-red-600 hover:text-white transition-all duration-300">
                                    <FaYoutube className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">HIZLI LİNKLER</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                    Ana Sayfa
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                    Tüm Ürünler
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Kategoriler */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">KATEGORİLER</h3>
                        <ul className="space-y-3">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link href={`/categories/${category.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 tracking-tight text-foreground">İLETİŞİM</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <FaMapMarkerAlt className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-muted-foreground pt-1 leading-relaxed">
                                    Tahtakale Mahallesi, Güvener İş Hanı<br />Özay Deri & Aksesuar
                                </span>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <FaPhoneAlt className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col gap-1 pt-1">
                                    <Link href="tel:+905559785553" className="text-sm text-muted-foreground hover:text-primary transition-colors">+90 555 978 55 53</Link>
                                    <Link href="tel:+902125286062" className="text-sm text-muted-foreground hover:text-primary transition-colors">+90 212 528 60 62</Link>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <FaEnvelope className="w-4 h-4" />
                                </div>
                                <Link href="mailto:ozayleather@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors break-all">
                                    ozayleather@gmail.com
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Alt Kısım */}
                <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        &copy; {new Date().getFullYear()} ÖZAY Deri / ÖZAY Leather Design. Tüm Hakları Saklıdır.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Gizlilik Politikası</Link>
                        <Link href="/" className="hover:text-foreground transition-colors">Mesafeli Satış Sözleşmesi</Link>
                        <Link href="/" className="hover:text-foreground transition-colors">İptal ve İade Koşulları</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
