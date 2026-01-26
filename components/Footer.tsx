"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formElement = e.target as HTMLFormElement;
      const formData = new URLSearchParams();
      formData.append('email', email);

      const response = await fetch('https://readdy.ai/api/form/d5nn0pkl56fkiit4nqo0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-emerald-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
              <p className="text-emerald-100">Subscribe for exclusive deals and new arrivals</p>
            </div>
            <form id="newsletterForm" onSubmit={handleSubmit} data-readdy-form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-6 py-3 rounded-full text-gray-900 focus:ring-2 focus:ring-white min-w-80 text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
          {submitStatus === 'success' && (
            <p className="text-white text-sm mt-3 text-center md:text-right">
              <i className="ri-check-line mr-1"></i>
              Successfully subscribed!
            </p>
          )}
          {submitStatus === 'error' && (
            <p className="text-red-200 text-sm mt-3 text-center md:text-right">
              <i className="ri-error-warning-line mr-1"></i>
              Failed to subscribe. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="font-['Pacifico'] text-3xl text-white mb-4">logo</div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted destination for premium products in Ghana. Quality, convenience, and exceptional service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <i className="ri-linkedin-fill"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Special Offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/order-tracking" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="https://readdy.ai/?ref=logo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Made with Readdy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Premium Store Ghana. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <i className="ri-shield-check-line text-emerald-500"></i>
                Secure Payment
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-truck-line text-emerald-500"></i>
                Fast Delivery
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-customer-service-line text-emerald-500"></i>
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
