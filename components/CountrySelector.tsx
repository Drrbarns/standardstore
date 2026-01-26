'use client';

import { useState, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  taxRate: number;
  shippingCost: number;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1', taxRate: 0.08, shippingCost: 0 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44', taxRate: 0.20, shippingCost: 15 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1', taxRate: 0.13, shippingCost: 12 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61', taxRate: 0.10, shippingCost: 20 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49', taxRate: 0.19, shippingCost: 15 },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33', taxRate: 0.20, shippingCost: 15 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34', taxRate: 0.21, shippingCost: 15 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39', taxRate: 0.22, shippingCost: 15 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31', taxRate: 0.21, shippingCost: 15 },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phoneCode: '+46', taxRate: 0.25, shippingCost: 18 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81', taxRate: 0.10, shippingCost: 25 },
  { code: 'CN', name: 'China', flag: '🇨🇳', phoneCode: '+86', taxRate: 0.13, shippingCost: 22 },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91', taxRate: 0.18, shippingCost: 18 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65', taxRate: 0.08, shippingCost: 20 },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', phoneCode: '+971', taxRate: 0.05, shippingCost: 25 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55', taxRate: 0.17, shippingCost: 30 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phoneCode: '+52', taxRate: 0.16, shippingCost: 15 },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phoneCode: '+27', taxRate: 0.15, shippingCost: 28 },
];

export default function CountrySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Country>(countries[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      const country = countries.find(c => c.code === savedCountry);
      if (country) setSelected(country);
    }
  }, []);

  const handleSelect = (country: Country) => {
    setSelected(country);
    localStorage.setItem('selectedCountry', country.code);
    window.dispatchEvent(new CustomEvent('countryChange', { detail: country }));
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredCountries = countries.filter(
    c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    selected.code === country.code ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{country.name}</div>
                      <div className="text-sm text-gray-500">
                        Tax: {(country.taxRate * 100).toFixed(0)}% • Shipping: ${country.shippingCost}
                      </div>
                    </div>
                  </div>
                  {selected.code === country.code && (
                    <i className="ri-check-line text-emerald-600 text-xl"></i>
                  )}
                </button>
              ))}
              
              {filteredCountries.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <i className="ri-search-line text-4xl mb-2"></i>
                  <p>No countries found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function getSelectedCountry(): Country {
  const savedCountry = localStorage.getItem('selectedCountry');
  return countries.find(c => c.code === savedCountry) || countries[0];
}

export function calculateTax(subtotal: number): number {
  const country = getSelectedCountry();
  return subtotal * country.taxRate;
}

export function getShippingCost(): number {
  const country = getSelectedCountry();
  return country.shippingCost;
}