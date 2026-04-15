'use client';

import Link from 'next/link';
import LazyImage from './LazyImage';

// Map common color names to hex values for swatches
const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match (e.g. "Light Blue" -> "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
  /** Exhibition mode: card + price only (Porials Pitch); no PDP link or cart */
  porials?: boolean;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = [],
  porials = false
}: ProductCardProps) {
  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

  const formatPrice = (val: number) => `GH\u20B5${val.toFixed(2)}`;

  const cardContent = (
    <>
      <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-emerald-700/10">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-sm">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-50 text-red-700 border border-red-100 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shadow-sm">
            -{discount}%
          </span>
        )}
        {!porials && !inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-800 transition-colors">
          {name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">
              {hasVariants && minVariantPrice
                ? `From ${formatPrice(minVariantPrice)}`
                : formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {!porials && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-sm flex-shrink-0">
              <i className="ri-arrow-right-line" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (porials) {
    return (
      <div className="group rounded-xl sm:rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/product/${slug}`}
      className="group rounded-xl sm:rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      {cardContent}
    </Link>
  );
}
