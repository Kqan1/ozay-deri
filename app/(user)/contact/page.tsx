import type { Metadata } from "next";
import Link from "next/link";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa";
import { siteConfig } from "@/lib/config";
import MapIframe from "@/components/ui/map-iframe";

export const metadata: Metadata = {
    title: "İletişim",
    description: "Özay Aksesuar iletişim bilgileri.",
};

export default function ContactPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">İletişim</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {/* Adres */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <FaMapMarkerAlt className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">Adres</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {siteConfig.contact.address}
                    </p>
                </div>

                {/* Telefon */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <FaPhoneAlt className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">Telefon</h3>
                    <div className="flex flex-col gap-2">
                        {siteConfig.contact.phones.map((phone, idx) => (
                            <Link
                                key={idx}
                                href={`tel:${phone.value}`}
                                className="text-muted-foreground hover:text-primary transition-colors font-medium"
                            >
                                {phone.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* E-Posta */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                        <FaEnvelope className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">E-Posta</h3>
                    <Link
                        href={`mailto:${siteConfig.contact.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                        {siteConfig.contact.email}
                    </Link>
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-6">
                        <FaWhatsapp className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">WhatsApp</h3>
                    <Link
                        href={siteConfig.links.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-green-600 transition-colors font-medium"
                    >
                        +90 555 978 55 53
                    </Link>
                </div>

                {/* Instagram */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600 mb-6">
                        <FaInstagram className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">Instagram</h3>
                    <Link
                        href={siteConfig.links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-pink-600 transition-colors font-medium"
                    >
                        @ozayaksesuar
                    </Link>
                </div>

                {/* TikTok */}
                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border shadow-sm transition-transform hover:-translate-y-1 duration-300">
                    <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-black dark:text-white mb-6">
                        <FaTiktok className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-foreground">TikTok</h3>
                    <Link
                        href={siteConfig.links.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                        @ozay.deri.aksesuar
                    </Link>
                </div>
            </div>

            {/* Harita */}
            <div className="w-full h-[400px] md:h-[600px] rounded-3xl overflow-hidden border bg-muted shadow-sm relative">
                <MapIframe src={siteConfig.contact.mapIframeUrl} />
            </div>
        </div>
    );
}
