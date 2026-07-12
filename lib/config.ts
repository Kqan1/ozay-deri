export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    metadata: {
        title: {
            default: "ÖZAY Deri",
            template: "%s | ÖZAY Deri",
        },
        description:
            "Özay Deri &amp; Aksesuar | Bileklik Aksesuarları, İp &amp; İplik Çeşitleri, Deri Çeşitleri | Tahtakale Mahallesi, Güvener İş Hanı Özay Deri &amp; Aksesuar",
        applicationName: "Özay Deri",
        author: { name: "Kqan", url: "https://github.com/Kqan1" },
        keywords: [""],
        icons: {
            icon: "/favicon.ico",
        },
        category: "shopping",
        generator: "next.js",
    },
    links: {
        url: "http://localhost:3000",
        github: "https://github.com/Kqan1",
        instagram: "https://instagram.com/ozayderi",
        facebook: "https://facebook.com/ozayderi",
        twitter: "https://twitter.com/ozayderi",
        youtube: "https://youtube.com/@ozayderi",
        whatsapp: "https://wa.me/905555555555",
    },
};
