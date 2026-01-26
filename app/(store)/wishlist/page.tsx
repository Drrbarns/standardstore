'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: '1',
      name: 'Premium Leather Crossbody Bag',
      price: 289.00,
      originalPrice: 399.00,
      image: 'https://readdy.ai/api/search-image?query=elegant%20premium%20leather%20crossbody%20bag%20in%20deep%20forest%20green%20color%20on%20clean%20minimal%20white%20studio%20background%20with%20soft%20natural%20lighting%20showcasing%20luxury%20craftsmanship%20and%20refined%20texture%20details%20professional%20product%20photography&width=800&height=800&seq=wish1&orientation=squarish',
      rating: 5,
      reviewCount: 124,
      badge: 'Best Seller',
      inStock: true
    },
    {
      id: '5',
      name: 'Designer Brass Table Lamp',
      price: 349.00,
      image: 'https://readdy.ai/api/search-image?query=contemporary%20designer%20brass%20table%20lamp%20with%20elegant%20silhouette%20on%20pure%20white%20background%20modern%20luxury%20lighting%20fixture%20sophisticated%20minimalist%20design%20premium%20quality%20metalwork%20studio%20photography&width=800&height=800&seq=wish2&orientation=squarish',
      rating: 5,
      reviewCount: 98,
      badge: 'Limited',
      inStock: true
    },
    {
      id: '6',
      name: 'Merino Wool Blend Scarf',
      price: 119.00,
      originalPrice: 159.00,
      image: 'https://readdy.ai/api/search-image?query=premium%20merino%20wool%20blend%20scarf%20in%20deep%20forest%20green%20color%20elegantly%20draped%20on%20white%20background%20luxury%20fashion%20accessory%20soft%20texture%20sophisticated%20styling%20high%20end%20product%20photography&width=800&height=800&seq=wish3&orientation=squarish',
      rating: 5,
      reviewCount: 143,
      inStock: true
    },
    {
      id: '11',
      name: 'Handwoven Jute Area Rug',
      price: 399.00,
      originalPrice: 499.00,
      image: 'https://readdy.ai/api/search-image?query=natural%20handwoven%20jute%20area%20rug%20in%20neutral%20cream%20color%20on%20white%20background%20texture%20detail%20premium%20home%20textile%20sophisticated%20craftsmanship%20product%20photography&width=800&height=800&seq=wish4&orientation=squarish',
      rating: 4,
      reviewCount: 87,
      inStock: false
    }
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const addAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    if (inStockItems.length > 0) {
      alert(`Added ${inStockItems.length} items to cart`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link href="/" className="text-gray-600 hover:text-emerald-700 transition-colors">Home</Link>
            <i className="ri-arrow-right-s-line text-gray-400"></i>
            <span className="text-gray-900 font-medium">Wishlist</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={addAllToCart}
                className="bg-gray-900 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Add All to Cart
              </button>
            )}
          </div>
        </div>
      </section>

      {wishlistItems.length === 0 ? (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 bg-gray-200 rounded-full">
              <i className="ri-heart-line text-5xl text-gray-400"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Save your favourite items here to easily find them later</p>
            <Link href="/shop" className="inline-block bg-gray-900 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap">
              Explore Products
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard {...product} />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                  >
                    <i className="ri-close-line text-gray-700 text-xl"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Share Your Wishlist</h2>
            <p className="text-emerald-100 mb-8 text-lg">Let friends and family know what you love</p>
            <div className="flex justify-center space-x-4">
              <button className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <i className="ri-twitter-x-fill text-xl"></i>
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <i className="ri-whatsapp-fill text-xl"></i>
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <i className="ri-mail-fill text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
