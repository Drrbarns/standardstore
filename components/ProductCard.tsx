'use client';

import Link from 'next/link';
import LazyImage from './LazyImage';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true
}: ProductCardProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <Link href={`/product/${id}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-gray-700 font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1 mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`${star <= rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'} text-sm`}
              ></i>
            ))}
          </div>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">GH₵{price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">GH₵{originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button 
          className="mt-4 w-full bg-gray-900 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
          disabled={!inStock}
        >
          <i className="ri-shopping-cart-line text-lg"></i>
          <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
}