'use client';

import { useState } from 'react';

interface PriceDropAlertProps {
  productId: string;
  productName: string;
  currentPrice: number;
  originalPrice?: number;
}

export default function PriceDropAlert({ productId, productName, currentPrice, originalPrice }: PriceDropAlertProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubscribed(true);
      setIsSubmitting(false);
      
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }, 1000);
  };

  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
      {discount > 0 && (
        <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-blue-200">
          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
            <i className="ri-price-tag-3-fill text-white"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-700">Price Dropped {discount}%!</p>
            <p className="text-xs text-blue-600">Was GH₵{originalPrice?.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="flex items-start space-x-2 mb-3">
        <div className="w-8 h-8 flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
          <i className="ri-notification-4-fill text-xl"></i>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-1">Get Price Drop Alerts</h4>
          <p className="text-sm text-gray-600">
            We'll notify you when the price drops further!
          </p>
        </div>
      </div>

      {!isSubscribed ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Subscribing...
              </>
            ) : (
              <>
                <i className="ri-notification-4-line mr-2"></i>
                Notify Me
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-emerald-500 text-white rounded-lg p-3 text-center">
          <i className="ri-check-line text-2xl mb-1"></i>
          <p className="text-sm font-semibold">You're subscribed! We'll notify you of price drops.</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        <i className="ri-shield-check-line mr-1"></i>
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
}
