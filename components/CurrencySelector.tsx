'use client';

import { useState, useEffect } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
];

export default function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Currency>(currencies[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) setSelected(currency);
    }
  }, []);

  const handleSelect = (currency: Currency) => {
    setSelected(currency);
    localStorage.setItem('selectedCurrency', currency.code);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currency }));
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredCurrencies = currencies.filter(
    c => 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors"
      >
        <span className="text-lg">{selected.symbol}</span>
        <span className="font-medium">{selected.code}</span>
        <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search currency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    selected.code === currency.code ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.symbol}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{currency.code}</div>
                      <div className="text-sm text-gray-500">{currency.name}</div>
                    </div>
                  </div>
                  {selected.code === currency.code && (
                    <i className="ri-check-line text-emerald-600 text-xl"></i>
                  )}
                </button>
              ))}
              
              {filteredCurrencies.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <i className="ri-search-line text-4xl mb-2"></i>
                  <p>No currencies found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function convertPrice(usdPrice: number): { amount: number; symbol: string; code: string } {
  const savedCurrency = localStorage.getItem('selectedCurrency');
  const currency = currencies.find(c => c.code === savedCurrency) || currencies[0];
  
  return {
    amount: usdPrice * currency.rate,
    symbol: currency.symbol,
    code: currency.code
  };
}

export function formatPrice(usdPrice: number): string {
  const { amount, symbol, code } = convertPrice(usdPrice);
  
  return `${symbol}${amount.toFixed(2)}`;
}