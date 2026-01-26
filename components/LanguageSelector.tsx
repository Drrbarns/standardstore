'use client';

import { useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Language>(languages[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      const language = languages.find(l => l.code === savedLanguage);
      if (language) setSelected(language);
    }
  }, []);

  const handleSelect = (language: Language) => {
    setSelected(language);
    localStorage.setItem('selectedLanguage', language.code);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredLanguages = languages.filter(
    l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="font-medium">{selected.code.toUpperCase()}</span>
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
                  placeholder="Search language..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleSelect(language)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                    selected.code === language.code ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{language.name}</div>
                      <div className="text-sm text-gray-500">{language.nativeName}</div>
                    </div>
                  </div>
                  {selected.code === language.code && (
                    <i className="ri-check-line text-emerald-600 text-xl"></i>
                  )}
                </button>
              ))}
              
              {filteredLanguages.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <i className="ri-search-line text-4xl mb-2"></i>
                  <p>No languages found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}