'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/query-cache';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function PorialsPitchPage() {
  usePageTitle('Porials Pitch');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await cachedQuery<{ data: any; error: any }>(
          'porials-pitch:products',
          async () =>
            supabase
              .from('products')
              .select(`
                *,
                categories(name, slug),
                product_images!product_id(url, position),
                product_variants(id, name, price, quantity, option1, option2, image_url)
              `)
              .eq('status', 'active')
              .eq('is_porials', true)
              .order('updated_at', { ascending: false }),
          2 * 60 * 1000
        );

        if (error) throw error;

        const rows = data || [];
        const formatted = rows.map((p: any) => {
          const variants = p.product_variants || [];
          const hasVariants = variants.length > 0;
          const minVariantPrice = hasVariants
            ? Math.min(...variants.map((v: any) => v.price || p.price))
            : undefined;
          const totalVariantStock = hasVariants
            ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
            : 0;
          const effectiveStock = hasVariants ? totalVariantStock : p.quantity;

          const img =
            p.product_images?.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))?.[0]?.url ||
            'https://via.placeholder.com/800?text=No+Image';

          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price) || 0,
            originalPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
            image: img,
            rating: p.rating_avg || 0,
            reviewCount: p.review_count || 0,
            inStock: effectiveStock > 0,
            maxStock: effectiveStock || 0,
            moq: p.moq || 1,
            hasVariants,
            minVariantPrice,
            colorVariants: [],
            porials: true as const,
          };
        });

        setProducts(formatted);
      } catch (e) {
        console.error('[Porials Pitch]', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="Porials Pitch"
        subtitle="Exhibition highlights — preview pieces and pricing. These items are not available for purchase on this page."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <i className="ri-palette-line text-5xl text-gray-300 mb-4 inline-block" aria-hidden />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No exhibition items yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Mark products as &quot;Porials&quot; in the admin catalog to show them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
