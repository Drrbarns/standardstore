'use client';

import Link from 'next/link';
import { useState } from 'react';
import CartCountdown from '@/components/CartCountdown';
import CartSuggestions from '@/components/CartSuggestions';
import AdvancedCouponSystem from '@/components/AdvancedCouponSystem';
import FreeShippingBar from '@/components/FreeShippingBar';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Premium Leather Crossbody Bag',
      price: 289.00,
      originalPrice: 399.00,
      image: 'https://readdy.ai/api/search-image?query=elegant%20premium%20leather%20crossbody%20bag%20in%20deep%20forest%20green%20color%20on%20clean%20minimal%20white%20studio%20background%20with%20soft%20natural%20lighting%20showcasing%20luxury%20craftsmanship%20and%20refined%20texture%20details%20professional%20product%20photography&width=400&height=400&seq=cart1&orientation=squarish',
      quantity: 1,
      color: 'Forest Green',
      size: 'Medium',
      inStock: true,
      stockCount: 15
    },
    {
      id: '2',
      name: 'Minimalist Ceramic Vase Set',
      price: 159.00,
      image: 'https://readdy.ai/api/search-image?query=modern%20minimalist%20ceramic%20vase%20set%20in%20matte%20cream%20and%20charcoal%20colors%20on%20pristine%20white%20background%20elegant%20home%20decor%20sophisticated%20styling%20clean%20lines%20premium%20quality%20artistic%20arrangement&width=400&height=400&seq=cart2&orientation=squarish',
      quantity: 1,
      color: 'Cream & Charcoal',
      size: 'Set of 3',
      inStock: true,
      stockCount: 22
    }
  ]);

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, Math.min(item.stockCount, newQuantity)) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const saveForLater = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      setSavedItems([...savedItems, item]);
      removeItem(id);
    }
  };

  const moveToCart = (id: string) => {
    const item = savedItems.find(item => item.id === id);
    if (item) {
      setCartItems([...cartItems, item]);
      setSavedItems(savedItems.filter(item => item.id !== id));
    }
  };

  const applyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = subtotal * (appliedCoupon.discount / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal - couponDiscount + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <CartCountdown />
        <FreeShippingBar currentAmount={subtotal} threshold={200} />

        {cartItems.length === 0 && savedItems.length === 0 ? (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 bg-gray-200 rounded-full">
                <i className="ri-shopping-cart-line text-5xl text-gray-400"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added anything to your cart yet</p>
              <Link href="/shop" className="inline-block bg-gray-900 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Continue Shopping
              </Link>
            </div>
          </section>
        ) : (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Cart Items ({cartItems.length})</h2>
                      {savings > 0 && (
                        <span className="text-emerald-700 font-semibold">You save GH₵{savings.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="space-y-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                          <Link href={`/product/${item.id}`} className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                          </Link>

                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <Link href={`/product/${item.id}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-700 transition-colors">
                                {item.name}
                              </Link>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <i className="ri-close-line text-xl"></i>
                              </button>
                            </div>

                            <div className="text-sm text-gray-600 mb-3 space-y-1">
                              {item.color && <p>Colour: {item.color}</p>}
                              {item.size && <p>Size: {item.size}</p>}
                              {item.inStock ? (
                                <p className="text-emerald-600 font-medium">In Stock</p>
                              ) : (
                                <p className="text-red-600 font-medium">Out of Stock</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline space-x-3">
                                <span className="text-xl font-bold text-gray-900">GH₵{item.price.toFixed(2)}</span>
                                {item.originalPrice && (
                                  <span className="text-sm text-gray-400 line-through">GH₵{item.originalPrice.toFixed(2)}</span>
                                )}
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <i className="ri-subtract-line"></i>
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-12 h-10 text-center border-x-2 border-gray-300 focus:outline-none font-semibold"
                                    min="1"
                                    max={item.stockCount}
                                  />
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <i className="ri-add-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => saveForLater(item.id)}
                              className="mt-3 text-sm text-emerald-700 hover:text-emerald-900 font-medium whitespace-nowrap"
                            >
                              Save for Later
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {savedItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Saved for Later ({savedItems.length})</h3>
                      <div className="space-y-4">
                        {savedItems.map((item) => (
                          <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                              <p className="text-lg font-bold text-gray-900 mb-2">GH₵{item.price.toFixed(2)}</p>
                              <button
                                onClick={() => moveToCart(item.id)}
                                className="text-sm text-emerald-700 hover:text-emerald-900 font-medium whitespace-nowrap"
                              >
                                Move to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">GH₵{subtotal.toFixed(2)}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700">
                          <div className="flex items-center space-x-2">
                            <span>Coupon ({appliedCoupon.code})</span>
                          </div>
                          <span className="font-semibold">-GH₵{couponDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span className="font-semibold">{shipping === 0 ? 'FREE' : `GH₵${shipping.toFixed(2)}`}</span>
                      </div>

                      {shipping > 0 && (
                        <p className="text-sm text-amber-600">
                          Add GH₵{(200 - subtotal).toFixed(2)} more for free shipping
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-6">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>GH₵{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <AdvancedCouponSystem
                      subtotal={subtotal}
                      onApply={applyCoupon}
                      onRemove={removeCoupon}
                      appliedCoupon={appliedCoupon}
                    />

                    <Link
                      href="/checkout"
                      className="block w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-lg font-semibold text-center transition-colors mt-6 mb-3 whitespace-nowrap"
                    >
                      Proceed to Checkout
                    </Link>

                    <Link
                      href="/shop"
                      className="block w-full text-center text-emerald-700 hover:text-emerald-900 font-semibold py-2 whitespace-nowrap"
                    >
                      Continue Shopping
                    </Link>

                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-shield-check-line text-emerald-700 mr-2"></i>
                        <span>Secure checkout</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-arrow-left-right-line text-emerald-700 mr-2"></i>
                        <span>30-day returns</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-customer-service-line text-emerald-700 mr-2"></i>
                        <span>24/7 support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <CartSuggestions />
      </div>
    </div>
  );
}
