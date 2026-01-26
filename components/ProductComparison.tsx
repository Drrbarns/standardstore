'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
  features?: string[];
}

export default function ProductComparison() {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('compareProducts');
    if (stored) {
      setCompareProducts(JSON.parse(stored));
    }
  }, []);

  const removeProduct = (productId: string) => {
    const updated = compareProducts.filter(p => p.id !== productId);
    setCompareProducts(updated);
    localStorage.setItem('compareProducts', JSON.stringify(updated));
  };

  const clearAll = () => {
    setCompareProducts([]);
    localStorage.removeItem('compareProducts');
    setIsOpen(false);
  };

  if (compareProducts.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
      >
        <span className="flex items-center">
          <i className="ri-survey-line mr-2 w-5 h-5 flex items-center justify-center"></i>
          Compare ({compareProducts.length})
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>

            <div className="relative bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">Compare Products</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <i className="ri-close-line text-2xl text-gray-700"></i>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto p-6">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-4 pr-4 text-sm font-semibold text-gray-700 border-b">Feature</th>
                      {compareProducts.map((product) => (
                        <th key={product.id} className="py-4 px-4 border-b">
                          <div className="relative">
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <i className="ri-close-line text-sm"></i>
                            </button>
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 w-32 mx-auto">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">{product.name}</h3>
                            <p className="text-lg font-bold text-emerald-700">GH₵{product.price.toFixed(2)}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Price</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center">
                          <div className="text-lg font-bold text-gray-900">GH₵{product.price.toFixed(2)}</div>
                          {product.originalPrice && (
                            <div className="text-sm text-gray-400 line-through">GH₵{product.originalPrice.toFixed(2)}</div>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Rating</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`${
                                  i < Math.floor(product.rating)
                                    ? 'ri-star-fill text-yellow-400'
                                    : 'ri-star-line text-gray-300'
                                }`}
                              ></i>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{product.rating} ({product.reviews})</div>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Category</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center text-sm text-gray-600">
                          {product.category}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Availability</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            product.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Colours</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center text-sm text-gray-600">
                          {product.colors?.join(', ') || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Sizes</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center text-sm text-gray-600">
                          {product.sizes?.join(', ') || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-700">Description</td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center text-sm text-gray-600">
                          {product.description}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="py-4 pr-4"></td>
                      {compareProducts.map((product) => (
                        <td key={product.id} className="py-4 px-4 text-center">
                          <Link
                            href={`/product/${product.id}`}
                            className="block w-full py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap"
                          >
                            View Details
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function addToCompare(product: Product) {
  if (typeof window === 'undefined') return { success: false, message: '' };

  const stored = localStorage.getItem('compareProducts');
  let compare: Product[] = stored ? JSON.parse(stored) : [];

  if (compare.find(p => p.id === product.id)) {
    return { success: false, message: 'Product already in comparison' };
  }

  if (compare.length >= 4) {
    return { success: false, message: 'Maximum 4 products can be compared' };
  }

  compare.push(product);
  localStorage.setItem('compareProducts', JSON.stringify(compare));
  return { success: true, message: 'Product added to comparison' };
}

export function removeFromCompare(productId: string) {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('compareProducts');
  let compare: Product[] = stored ? JSON.parse(stored) : [];
  compare = compare.filter(p => p.id !== productId);
  localStorage.setItem('compareProducts', JSON.stringify(compare));
}
