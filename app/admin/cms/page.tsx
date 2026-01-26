'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CMSSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  items: string[];
}

export default function CMSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const cmsSections: CMSSection[] = [
    {
      id: 'homepage',
      name: 'Homepage',
      description: 'Edit hero sections, banners, featured products, and homepage content',
      icon: 'ri-home-4-line',
      path: '/admin/homepage',
      items: ['Hero Section', 'Featured Categories', 'Best Sellers', 'Testimonials', 'Newsletter Banner']
    },
    {
      id: 'navigation',
      name: 'Navigation & Menus',
      description: 'Manage header, footer, and mobile navigation menus',
      icon: 'ri-menu-line',
      path: '/admin/cms/navigation',
      items: ['Header Menu', 'Footer Menu', 'Mobile Bottom Nav', 'Quick Links']
    },
    {
      id: 'pages',
      name: 'Pages',
      description: 'Edit content for all static pages',
      icon: 'ri-pages-line',
      path: '/admin/cms/pages',
      items: ['About Us', 'Contact', 'FAQs', 'Privacy Policy', 'Terms & Conditions', 'Shipping Info', 'Returns Policy']
    },
    {
      id: 'products',
      name: 'Products',
      description: 'Manage product listings, descriptions, and images',
      icon: 'ri-shopping-bag-3-line',
      path: '/admin/products',
      items: ['Product Catalog', 'Product Descriptions', 'Product Images', 'Product Categories', 'Product Tags']
    },
    {
      id: 'blog',
      name: 'Blog & Content',
      description: 'Create and manage blog posts and articles',
      icon: 'ri-article-line',
      path: '/admin/blog',
      items: ['Blog Posts', 'Featured Articles', 'Blog Categories', 'Author Profiles']
    },
    {
      id: 'media',
      name: 'Media Library',
      description: 'Upload and manage all website images and media',
      icon: 'ri-image-2-line',
      path: '/admin/cms/media',
      items: ['Images', 'Banners', 'Product Photos', 'Logo & Icons', 'Video Content']
    },
    {
      id: 'banners',
      name: 'Banners & Promotions',
      description: 'Create promotional banners and announcement bars',
      icon: 'ri-megaphone-line',
      path: '/admin/cms/banners',
      items: ['Flash Sale Banners', 'Announcement Bar', 'Promotional Popups', 'Seasonal Campaigns']
    },
    {
      id: 'email',
      name: 'Email Templates',
      description: 'Customize email templates for orders, shipping, and marketing',
      icon: 'ri-mail-line',
      path: '/admin/cms/email',
      items: ['Order Confirmation', 'Shipping Updates', 'Welcome Email', 'Newsletter Template', 'Abandoned Cart']
    },
    {
      id: 'seo',
      name: 'SEO & Meta',
      description: 'Manage SEO settings, meta tags, and descriptions',
      icon: 'ri-search-eye-line',
      path: '/admin/cms/seo',
      items: ['Meta Titles', 'Meta Descriptions', 'Keywords', 'Structured Data', 'Sitemap']
    },
    {
      id: 'styles',
      name: 'Theme & Styling',
      description: 'Customize colors, fonts, and overall site appearance',
      icon: 'ri-palette-line',
      path: '/admin/cms/styles',
      items: ['Color Scheme', 'Typography', 'Button Styles', 'Layout Settings', 'Custom CSS']
    },
    {
      id: 'legal',
      name: 'Legal & Compliance',
      description: 'Manage legal documents and compliance content',
      icon: 'ri-shield-check-line',
      path: '/admin/cms/legal',
      items: ['Cookie Policy', 'GDPR Compliance', 'Terms of Service', 'Refund Policy', 'Disclaimer']
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Configure social media links and integrations',
      icon: 'ri-share-line',
      path: '/admin/cms/social',
      items: ['Social Links', 'Instagram Feed', 'Social Sharing', 'Social Proof Widgets']
    }
  ];

  const filteredSections = cmsSections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management System</h1>
            <p className="text-gray-600 mt-2">Edit and manage all website content from one place</p>
          </div>
          <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-2">
            <i className="ri-save-line"></i>
            Save All Changes
          </button>
        </div>

        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400 text-xl"></i>
            </div>
            <input
              type="text"
              placeholder="Search CMS sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className={`${section.icon} text-2xl text-teal-600`}></i>
                </div>
                <Link
                  href={section.path}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Editor
                </Link>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              
              {activeSection === section.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-3">Editable Items</p>
                  <div className="space-y-2">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem(editingItem === `${section.id}-${index}` ? null : `${section.id}-${index}`);
                        }}
                      >
                        <span className="text-sm text-gray-700">{item}</span>
                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Quick Tips for CMS</h2>
              <ul className="space-y-2 text-teal-50">
                <li className="flex items-start gap-2">
                  <i className="ri-check-line mt-1"></i>
                  <span>Always save changes before navigating away from a section</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line mt-1"></i>
                  <span>Use preview mode to see changes before publishing</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line mt-1"></i>
                  <span>Optimize images before uploading to improve site speed</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line mt-1"></i>
                  <span>Keep SEO meta descriptions between 150-160 characters</span>
                </li>
              </ul>
            </div>
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-lightbulb-line text-5xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
