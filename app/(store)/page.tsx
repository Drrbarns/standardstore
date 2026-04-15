'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import ProductCard, {
  type ColorVariant,
  getColorHex,
} from '@/components/ProductCard';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const { getSetting, getActiveBanners } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const heroSlides = [
    { src: '/hero-1.png', position: '50% 30%' },
    { src: '/hero-2.png', position: '50% 20%' },
    { src: '/hero-3.png', position: '50% 20%' },
  ];
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          supabase
            .from('products')
            .select('*, product_variants(*), product_images(*)')
            .eq('status', 'active')
            .eq('is_porials', false)
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('categories')
            .select('id, name, slug, parent_id, position, metadata')
            .eq('status', 'active')
            .contains('metadata', { featured: true })
            .is('parent_id', null)
            .order('position', { ascending: true })
            .limit(4),
        ]);

        if (productsResult.error) throw productsResult.error;
        setFeaturedProducts(productsResult.data || []);

        if (categoriesResult.error) throw categoriesResult.error;
        setFeaturedCategories(categoriesResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const heroHeadline =
    getSetting('hero_headline') || 'Mannequins, Kitchen Essentials, Electronics & Dresses — All In One Store';
  const heroSubheadline =
    getSetting('hero_subheadline') ||
    'Verified quality China-sourced products at unbeatable prices. Perfect for homes, businesses, and resellers.';
  const heroPrimaryText = getSetting('hero_primary_btn_text') || 'Shop Now';
  const heroPrimaryLink = getSetting('hero_primary_btn_link') || '/shop';
  const heroSecondaryText =
    getSetting('hero_secondary_btn_text') || 'Our Story';
  const heroSecondaryLink = getSetting('hero_secondary_btn_link') || '/about';

  const activeBanners = getActiveBanners('top');

  const renderBanners = () => {
    if (activeBanners.length === 0) return null;
    return (
      <div className="bg-emerald-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span
              key={index}
              className="mx-8 text-sm font-medium tracking-wide flex items-center"
            >
              {banner.title}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const popularProducts = featuredProducts.slice(0, 8);
  const latestProducts = featuredProducts;
  const defaultCategoryStyles = [
    {
      chip: 'Top sellers',
      icon: 'ri-star-smile-line',
      color: 'from-emerald-500 to-emerald-700',
    },
    {
      chip: 'Premium picks',
      icon: 'ri-vip-crown-line',
      color: 'from-sky-400 to-cyan-600',
    },
    {
      chip: 'Best value',
      icon: 'ri-price-tag-3-line',
      color: 'from-amber-400 to-amber-600',
    },
    {
      chip: 'Just landed',
      icon: 'ri-sparkling-line',
      color: 'from-slate-600 to-slate-900',
    },
  ];
  const fallbackCategories = [
    { name: 'Kitchen Essentials', slug: 'kitchen-essentials', metadata: {} },
    { name: 'Electronics', slug: 'electronics', metadata: {} },
    { name: 'Fashion & Dresses', slug: 'fashion-dresses', metadata: {} },
    { name: 'New Arrivals', slug: 'new-arrivals', metadata: {} },
  ];
  const vibeCategories = (featuredCategories.length > 0
    ? featuredCategories
    : fallbackCategories
  )
    .slice(0, 4)
    .map((category, index) => {
      const style = defaultCategoryStyles[index % defaultCategoryStyles.length];
      return {
        ...category,
        chip: category.metadata?.chip || style.chip,
        icon: category.metadata?.icon || style.icon,
        color: category.metadata?.color || style.color,
      };
    });

  const renderProductCard = (product: any) => {
    const variants = product.product_variants || [];
    const hasVariants = variants.length > 0;
    const minVariantPrice = hasVariants
      ? Math.min(...variants.map((v: any) => v.price || product.price))
      : undefined;
    const totalVariantStock = hasVariants
      ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
      : 0;
    const effectiveStock = hasVariants ? totalVariantStock : product.quantity;

    const colorVariants: ColorVariant[] = [];
    const seenColors = new Set<string>();
    for (const v of variants) {
      const colorName = (v as any).option2;
      if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
        const hex = getColorHex(colorName);
        if (hex) {
          seenColors.add(colorName.toLowerCase().trim());
          colorVariants.push({ name: colorName.trim(), hex });
        }
      }
    }

    return (
      <ProductCard
        key={product.id}
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={product.price}
        originalPrice={product.compare_at_price}
        image={
          product.product_images?.[0]?.url ||
          'https://via.placeholder.com/400x500'
        }
        rating={product.rating_avg || 5}
        reviewCount={product.review_count || 0}
        badge={product.featured ? 'Featured' : 'Trending'}
        inStock={effectiveStock > 0}
        maxStock={effectiveStock || 50}
        moq={product.moq || 1}
        hasVariants={hasVariants}
        minVariantPrice={minVariantPrice}
        colorVariants={colorVariants}
      />
    );
  };

  return (
    <main className="flex-col items-center justify-between min-h-screen bg-white">
      {renderBanners()}

      {/* Hero */}
      <section className="relative w-full min-h-[78vmin] sm:min-h-[83vmin] md:min-h-[93vmin] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={index === 0}
                quality={100}
                unoptimized
                sizes="100vw"
                className="object-cover"
                style={{
                  objectPosition: slide.position,
                  filter: 'contrast(1.06) saturate(1.05)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/95 mb-4 sm:mb-5">
            Sarah Lawson Imports · Premium Quality
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold leading-tight text-white drop-shadow-sm max-w-3xl mx-auto">
            {heroHeadline}
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto px-2 sm:px-0">
            {heroSubheadline}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={heroPrimaryLink}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-2.5 sm:px-9 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-emerald-800 transition-colors"
            >
              {heroPrimaryText}
              <i className="ri-arrow-right-up-line ml-2 text-base" />
            </Link>
            <Link
              href={heroSecondaryLink}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border-2 border-white/50 px-6 py-2.5 sm:px-9 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-white hover:text-gray-900 transition-colors"
            >
              {heroSecondaryText}
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/85">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/15">
                <i className="ri-shield-check-line text-emerald-200 text-sm sm:text-base" />
              </span>
              <span className="font-medium">Verified quality products</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/15">
                <i className="ri-truck-line text-emerald-200 text-sm sm:text-base" />
              </span>
              <span className="font-medium">Nationwide delivery</span>
            </div>
          </div>
          {heroSlides.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {heroSlides.map((slide, index) => (
                <span
                  key={`dot-${slide.src}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentHeroSlide ? 'w-6 bg-white' : 'w-2 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <AnimatedSection className="bg-white py-8 sm:py-10 border-b border-emerald-700/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-700 uppercase">
                Shop by category
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Find exactly what you need
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-medium text-emerald-800 hover:text-emerald-700"
            >
              Browse full catalogue
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vibeCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/shop?category=${encodeURIComponent(item.slug)}`}
                className="group relative overflow-hidden rounded-2xl border border-emerald-700/10 bg-emerald-50/40 p-4 hover:border-emerald-700 transition-colors"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-70 blur-2xl group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-emerald-800 mb-2">
                      {item.chip}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-emerald-800 group-hover:translate-y-[-2px] group-hover:shadow-md transition-all">
                    <i className={`${item.icon} text-lg`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Trending Products */}
      <AnimatedSection className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-700 uppercase">
                Trending now
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Products our customers love
              </h2>
            </div>
            <Link
              href="/shop?sort=bestsellers"
              className="inline-flex items-center text-sm font-medium text-gray-800 hover:text-emerald-800"
            >
              View all products
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[4/5] rounded-2xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {popularProducts.map(renderProductCard)}
            </AnimatedGrid>
          )}
        </div>
      </AnimatedSection>

      {/* Just Landed Scroller */}
      <AnimatedSection className="bg-emerald-50/55 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-800 uppercase">
                Just landed
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-800">
                Fresh stock & restocks
              </h2>
            </div>
            <p className="text-sm text-emerald-800/85 max-w-md">
              Discover new arrivals — kitchen essentials, electronics,
              mannequins, dresses, and everyday items at great prices.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-just-landed-scroll pb-2 [--card-width:240px] hover:[animation-play-state:paused]">
              {[...(latestProducts.length ? latestProducts : popularProducts), ...(latestProducts.length ? latestProducts : popularProducts)].map(
                (product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="min-w-[180px] sm:min-w-[220px] max-w-[260px] w-[var(--card-width)] flex-shrink-0"
                  >
                    {renderProductCard(product)}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Customers Stay */}
      <AnimatedSection className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-700 uppercase">
              Why customers trust us
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Built on quality, value, and trust
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              Every product is hand-selected and quality-checked to ensure you
              get the best value for your money, every single time.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
            {[
              {
                icon: 'ri-verified-badge-line',
                title: 'Verified quality from source',
                body: 'Products sourced directly from factories, personally inspected for quality before reaching your hands.',
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Real support, real people',
                body: 'Our team helps with product questions, order tracking, and recommendations so you shop with confidence.',
              },
              {
                icon: 'ri-truck-line',
                title: 'Reliable nationwide delivery',
                body: 'Order from anywhere in Ghana with tracked delivery, smooth support, and reliable updates.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-emerald-700/10 bg-emerald-50/40 p-6"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-700/25 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-md">
                    <i className={`${item.icon} text-xl`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Banner */}
      <section className="pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-emerald-900 text-white border border-emerald-800 shadow-[0_16px_45px_rgba(6,78,59,0.28)] flex flex-col md:flex-row items-center md:items-stretch">
            <div className="relative w-full md:w-3/5 px-5 sm:px-8 py-8 sm:py-10 flex flex-col justify-center space-y-3 text-center md:text-left">
              <span className="inline-flex items-center text-xs font-semibold tracking-[0.25em] uppercase text-emerald-200">
                Shop with Sarah Lawson Imports
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">
                Premium products at unbeatable prices.
              </h3>
              <p className="text-sm sm:text-base text-emerald-100 max-w-md mx-auto md:mx-0">
                Discover quality kitchen essentials, electronics, mannequins,
                dresses, and more — sourced directly and delivered to your door.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full bg-white text-emerald-900 px-8 py-3 text-sm font-semibold shadow-lg hover:bg-emerald-50 transition-colors"
                >
                  Start shopping
                  <i className="ri-arrow-right-up-line ml-2" />
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
            <div className="relative w-full md:w-2/5 py-4 sm:py-6 pr-4 pl-4 md:pl-0 flex justify-center">
              <div className="relative h-40 sm:h-52 md:h-64 lg:h-full min-h-[12rem] w-full max-w-sm md:max-w-none rounded-2xl border border-white/20 bg-emerald-800 p-5 flex flex-col justify-center gap-3 shadow-[0_22px_45px_rgba(0,0,0,0.24)]">
                <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  Sarah Lawson Imports
                </span>
                <p className="text-lg sm:text-xl font-bold text-white leading-snug">
                  Quality products, direct from the source
                </p>
                <div className="space-y-1 text-sm text-emerald-100">
                  <p className="inline-flex items-center gap-2">
                    <i className="ri-map-pin-line" /> Accra, Ghana
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <i className="ri-shield-check-line" /> Verified quality
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <i className="ri-truck-line" /> Nationwide delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
