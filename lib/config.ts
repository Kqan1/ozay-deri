export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    metadata: {
        metadataBase: new URL("https://özayderiaksesuar.com"),
        title: {
            default: "ÖZAY Deri & Aksesuar",
            template: "%s | ÖZAY Deri & Aksesuar",
        },
        description:
            "Özay Deri & Aksesuar | Bileklik Aksesuarları, İp ve İplik Çeşitleri, Deri Çeşitleri, Takı Malzemeleri | Tahtakale Mahallesi, Güvener İş Hanı, Eminönü - Özay Deri & Aksesuar",
        applicationName: "ÖZAY Deri & Aksesuar",
        authors: [{ name: "Kqan", url: "https://github.com/Kqan1" }],
        keywords: [
            "özay deri ve aksesuar",
            "özay aksesuar",
            "deri bileklik",
            "ip çeşitleri",
            "tahtakale aksesuar",
            "eminönü takı malzemeleri",
            "deri çeşitleri",
            "toptan aksesuar",
            "takı aparatları"
        ],
        icons: {
            icon: "/favicon.ico",
            apple: "/icon.png",
        },
        openGraph: {
            type: "website",
            locale: "tr_TR",
            url: "https://özayderiaksesuar.com",
            title: "ÖZAY Deri & Aksesuar - Deri, İp ve Takı Malzemeleri",
            description: "Bileklik aksesuarları, deri ve ip çeşitleri ile aradığınız her türlü takı malzemesi Tahtakale'de Özay Deri & Aksesuar'da.",
            siteName: "ÖZAY Deri & Aksesuar",
            images: [
                {
                    url: "/icon.png",
                    width: 512,
                    height: 512,
                    alt: "Özay Deri & Aksesuar Logo",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: "ÖZAY Deri & Aksesuar",
            description: "Deri, ip ve takı malzemelerinde kalite ve güvenin adresi.",
            images: ["/icon.png"],
        },
        category: "shopping",
        generator: "Next.js",
    },
    links: {
        url: "https://özayderiaksesuar.com",
        github: "https://github.com/Kqan1",
        instagram: "https://www.instagram.com/ozayaksesuar?igsh=MXg3cTdvYmI2c3dlZQ==",
        whatsapp: "https://wa.me/+905559785553",
        tiktok: "https://www.tiktok.com/@ozay.deri.aksesuar?_r=1&_t=ZS-983MG2CjW68",
    },
    contact: {
        address: "Tahtakale Mahallesi, Güvener İş Hanı\nÖzay Deri & Aksesuar",
        phones: [
            { label: "+90 555 978 55 53", value: "+905559785553" },
            { label: "+90 212 528 60 62", value: "+902125286062" },
        ],
        email: "ozayleather@gmail.com",
        mapIframeUrl:
            "https://maps.google.com/maps?q=Tahtakale%20Mahallesi,%20G%C3%BCvener%20%C4%B0%C5%9F%20Han%C4%B1%20%C3%96zay%20Deri&t=&z=15&ie=UTF8&iwloc=&output=embed",
    },
    quickLinks: [
        { label: "Ana Sayfa", href: "/" },
        { label: "Tüm Ürünler", href: "/search" },
        { label: "İletişim", href: "/contact" },
    ],
};
