export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    metadata: {
        title: {
            default: "ÖZAY Aksesuar",
            template: "%s | ÖZAY Aksesuar",
        },
        description:
            "Özay Aksesuar | Bileklik Aksesuarları, İp &amp; İplik Çeşitleri, Deri Çeşitleri | Tahtakale Mahallesi, Güvener İş Hanı Özay Aksesuar",
        applicationName: "Özay Aksesuar",
        author: { name: "Kqan", url: "https://github.com/Kqan1" },
        keywords: [""],
        icons: {
            icon: "/favicon.ico",
        },
        category: "shopping",
        generator: "next.js",
    },
    links: {
        url: "https://ozay-deri-amber.vercel.app/",
        github: "https://github.com/Kqan1",
        instagram: "https://www.instagram.com/ozayaksesuar?igsh=MXg3cTdvYmI2c3dlZQ==",
        whatsapp: "https://wa.me/+905559785553",
        tiktok: "https://www.tiktok.com/@zay.deri.aksesuar?_r=1&_t=ZS-981zV2pxH1x",
    },
    contact: {
        address: "Tahtakale Mahallesi, Güvener İş Hanı\nÖzay Aksesuar",
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
        { label: "Tüm Ürünler", href: "/shop" },
        { label: "İletişim", href: "/contact" },
    ],
};
