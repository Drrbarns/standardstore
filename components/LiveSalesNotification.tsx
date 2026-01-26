'use client';

import { useState, useEffect } from 'react';

interface SaleNotification {
  customer: string;
  product: string;
  location: string;
  timeAgo: string;
}

export default function LiveSalesNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleNotification | null>(null);

  const salesData: SaleNotification[] = [
    { customer: 'Sarah from Accra', product: 'Premium Wireless Headphones', location: 'Accra', timeAgo: '2 minutes ago' },
    { customer: 'Michael from Kumasi', product: 'Smart Fitness Watch', location: 'Kumasi', timeAgo: '5 minutes ago' },
    { customer: 'Emma from Tema', product: 'Leather Crossbody Bag', location: 'Tema', timeAgo: '8 minutes ago' },
    { customer: 'David from Takoradi', product: 'Minimalist Ceramic Vase Set', location: 'Takoradi', timeAgo: '12 minutes ago' },
    { customer: 'Lisa from Cape Coast', product: 'Designer Sunglasses', location: 'Cape Coast', timeAgo: '15 minutes ago' }
  ];

  useEffect(() => {
    const showNotification = () => {
      const randomSale = salesData[Math.floor(Math.random() * salesData.length)];
      setCurrentSale(randomSale);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const interval = setInterval(showNotification, 15000);
    
    setTimeout(showNotification, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !currentSale) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-in-left">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-sm border-2 border-emerald-100">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-full flex-shrink-0">
            <i className="ri-shopping-cart-fill text-emerald-700 text-xl"></i>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-700">Just purchased</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {currentSale.customer}
            </p>
            <p className="text-xs text-gray-600 mb-1 line-clamp-1">
              {currentSale.product}
            </p>
            <p className="text-xs text-gray-500">{currentSale.timeAgo}</p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
