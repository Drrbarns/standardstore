'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminHomepagePage() {
  const [activeTab, setActiveTab] = useState('hero');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configuration State
  const [config, setConfig] = useState<any>({
    hero: {
      headline: 'Elevate Your Everyday Living',
      subheadline: 'Discover thoughtfully curated products that blend timeless design with exceptional quality.',
      primaryButtonText: 'Shop Collection',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'Learn More',
      secondaryButtonLink: '/about',
      backgroundImage: ''
    },
    categories: {
      enabled: true,
      title: 'Shop by Category',
      subtitle: 'Explore our carefully curated collections'
      // Actual selection logic would go here ideally
    },
    sections: {
      newArrivals: { enabled: true, title: 'New Arrivals', count: 8 },
      bestSellers: { enabled: true, title: 'Best Sellers', count: 8 }
    },
    banners: [
      { id: 'banner1', type: 'info', text: 'Free Shipping on Orders Over GH₵ 200', active: true },
      { id: 'banner2', type: 'promo', text: 'Get 10% off your first order when you subscribe', active: true }
    ],
    // Simplified testimonials for MVP
    testimonials: [
      { name: 'Ama Osei', text: 'Absolutely love the quality!', rating: 5, active: true },
      { name: 'Kwame Mensah', text: 'Fast delivery and great service.', rating: 5, active: true }
    ]
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'homepage_config')
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore 406/Not found if just missing
        console.error('Error fetching config:', error);
      }

      if (data) {
        // Merge with default to ensure structure
        setConfig((prev: any) => ({ ...prev, ...data.value }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          key: 'homepage_config',
          value: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Homepage configuration saved successfully!');
    } catch (err: any) {
      alert('Error saving config: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setSaving(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Math.random()}.${fileExt}`;
      const filePath = `cms/${fileName}`;

      // Create cms bucket if might not exist, but usually standard is 'storage' or similar. 
      // We'll use 'products' bucket or check if 'cms' exists. 
      // For safety in this demo, reusing 'products' bucket public folder concept if needed, 
      // OR better, let's try a 'content' folder in 'products' bucket or similar.
      // Actually, usually we should have a 'content' bucket.
      // Let's assume 'products' is safe and open for now to avoid creating new buckets via SQL if not needed.

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setConfig((prev: any) => ({
        ...prev,
        hero: { ...prev.hero, backgroundImage: publicUrl }
      }));

    } catch (error: any) {
      alert('Upload Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const updateNestedConfig = (section: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Management</h1>
          <p className="text-gray-600 mt-1">Customize your homepage content and layout</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <i className="ri-eye-line mr-2"></i>
            Preview
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center"
          >
            {saving ? <i className="ri-loader-4-line animate-spin mr-2"></i> : <i className="ri-save-line mr-2"></i>}
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {[
              { id: 'hero', label: 'Hero Section', icon: 'ri-image-line' },
              { id: 'sections', label: 'Product Sections', icon: 'ri-layout-line' },
              { id: 'banners', label: 'Banners', icon: 'ri-megaphone-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                    ? 'border-emerald-700 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <i className={`${tab.icon} text-xl`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'hero' && (
            <div className="space-y-6 max-w-4xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hero Configuration</h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Headline</label>
                  <input
                    type="text"
                    value={config.hero.headline}
                    onChange={(e) => updateNestedConfig('hero', 'headline', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Subheadline</label>
                  <textarea
                    rows={2}
                    value={config.hero.subheadline}
                    onChange={(e) => updateNestedConfig('hero', 'subheadline', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Primary Button Text</label>
                    <input
                      type="text"
                      value={config.hero.primaryButtonText}
                      onChange={(e) => updateNestedConfig('hero', 'primaryButtonText', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Hero Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 relative">
                    {config.hero.backgroundImage ? (
                      <div className="relative group">
                        <img src={config.hero.backgroundImage} alt="Hero" className="h-48 mx-auto object-cover rounded-lg shadow-sm" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg transition-opacity">
                          <label className="cursor-pointer bg-white px-4 py-2 rounded text-sm font-bold shadow-lg">
                            Change Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block p-4">
                        <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-2"></i>
                        <p className="text-gray-700">Click to upload image</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageUpload} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 1920x800px</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6 max-w-4xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Homepage Sections</h3>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">New Arrivals</span>
                  <input
                    type="checkbox"
                    checked={config.sections.newArrivals.enabled}
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, sections: { ...prev.sections, newArrivals: { ...prev.sections.newArrivals, enabled: e.target.checked } } }))}
                    className="w-5 h-5 accent-emerald-700 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={config.sections.newArrivals.title}
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, sections: { ...prev.sections, newArrivals: { ...prev.sections.newArrivals, title: e.target.value } } }))}
                    className="px-3 py-2 border rounded"
                    placeholder="Section Title"
                  />
                  <input
                    type="number"
                    value={config.sections.newArrivals.count}
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, sections: { ...prev.sections, newArrivals: { ...prev.sections.newArrivals, count: parseInt(e.target.value) } } }))}
                    className="px-3 py-2 border rounded"
                    placeholder="Count"
                  />
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Best Sellers</span>
                  <input
                    type="checkbox"
                    checked={config.sections.bestSellers?.enabled ?? true}
                    // Simplified handler for brevity, similar logic applies
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, sections: { ...prev.sections, bestSellers: { ...prev.sections.bestSellers, enabled: e.target.checked } } }))}
                    className="w-5 h-5 accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-4 max-w-4xl">
              <h3 className="text-lg font-bold text-gray-900">Announcement Banners</h3>
              {config.banners.map((banner: any, index: number) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                  <input
                    type="text"
                    value={banner.text}
                    onChange={(e) => {
                      const newBanners = [...config.banners];
                      newBanners[index].text = e.target.value;
                      setConfig({ ...config, banners: newBanners });
                    }}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Active</span>
                    <input
                      type="checkbox"
                      checked={banner.active}
                      onChange={(e) => {
                        const newBanners = [...config.banners];
                        newBanners[index].active = e.target.checked;
                        setConfig({ ...config, banners: newBanners });
                      }}
                      className="w-5 h-5 accent-emerald-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
