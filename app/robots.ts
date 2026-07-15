import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = siteConfig.metadata.metadataBase?.toString().replace(/\/$/, '') || 'https://özayderiaksesuar.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
