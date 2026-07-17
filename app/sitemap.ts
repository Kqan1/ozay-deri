import { MetadataRoute } from 'next';
import { getCachedSitemapCategories, getCachedSitemapProducts } from '@/lib/cached-queries';
import { siteConfig } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.metadata.metadataBase?.toString().replace(/\/$/, '') || 'https://özayderiaksesuar.com';

    // Sabit Sayfalar (Static Routes)
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    try {
        // Dinamik Kategoriler (Dynamic Routes)
        const categories = await getCachedSitemapCategories();

        const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
            url: `${baseUrl}/categories/${category.id}`,
            lastModified: category.updatedAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // Ürünler (Dynamic Routes)
        const products = await getCachedSitemapProducts();

        const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
            // Ürünler modalda açıldığı için veya direkt linki çalışması için /search?productId=...
            url: `${baseUrl}/search?productId=${product.id}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        return [...staticRoutes, ...categoryRoutes, ...productRoutes];
    } catch (error) {
        console.error("Sitemap oluşturulurken hata:", error);
        // Hata durumunda sadece sabit sayfaları dön
        return staticRoutes;
    }
}
