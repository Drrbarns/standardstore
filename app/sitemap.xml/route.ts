export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = 'https://yourstore.com';
  
  const staticPages = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/blog',
    '/faqs',
    '/terms',
    '/privacy',
    '/shipping',
    '/returns',
    '/categories',
    '/wishlist',
    '/cart',
    '/auth/login',
    '/auth/signup'
  ];

  const products = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    lastmod: new Date().toISOString()
  }));

  const blogPosts = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    lastmod: new Date().toISOString()
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  
  ${products.map(product => `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${product.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  
  ${blogPosts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
