'use client';

import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

export default function NavigationEditor() {
  const [headerMenu, setHeaderMenu] = useState<MenuItem[]>([
    { id: '1', label: 'Shop', url: '/shop' },
    { id: '2', label: 'Categories', url: '/categories' },
    { id: '3', label: 'About', url: '/about' },
    { id: '4', label: 'Contact', url: '/contact' }
  ]);

  const [footerMenu, setFooterMenu] = useState<MenuItem[]>([
    { id: '1', label: 'Privacy Policy', url: '/privacy' },
    { id: '2', label: 'Terms & Conditions', url: '/terms' },
    { id: '3', label: 'Shipping Info', url: '/shipping' },
    { id: '4', label: 'Returns', url: '/returns' }
  ]);

  const [editingMenu, setEditingMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleAddItem = (menuType: 'header' | 'footer') => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: 'New Menu Item',
      url: '/'
    };

    if (menuType === 'header') {
      setHeaderMenu([...headerMenu, newItem]);
    } else {
      setFooterMenu([...footerMenu, newItem]);
    }
  };

  const handleEditItem = (item: MenuItem, menuType: string) => {
    setEditingItem(item);
    setEditingMenu(menuType);
  };

  const handleDeleteItem = (id: string, menuType: 'header' | 'footer') => {
    if (menuType === 'header') {
      setHeaderMenu(headerMenu.filter(item => item.id !== id));
    } else {
      setFooterMenu(footerMenu.filter(item => item.id !== id));
    }
  };

  const renderMenuItems = (items: MenuItem[], menuType: 'header' | 'footer') => (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center cursor-move">
            <i className="ri-draggable text-gray-400"></i>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-500">{item.url}</p>
          </div>
          <button
            onClick={() => handleEditItem(item, menuType)}
            className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => handleDeleteItem(item.id, menuType)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Navigation Editor</h1>
            <p className="text-gray-600 mt-2">Manage header, footer, and mobile navigation menus</p>
          </div>
          <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap">
            <i className="ri-save-line mr-2"></i>
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Header Menu</h2>
                <p className="text-sm text-gray-600 mt-1">Main navigation at the top of the site</p>
              </div>
              <button
                onClick={() => handleAddItem('header')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Add Item
              </button>
            </div>
            {renderMenuItems(headerMenu, 'header')}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Footer Menu</h2>
                <p className="text-sm text-gray-600 mt-1">Links displayed in the footer section</p>
              </div>
              <button
                onClick={() => handleAddItem('footer')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Add Item
              </button>
            </div>
            {renderMenuItems(footerMenu, 'footer')}
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mobile Bottom Navigation</h2>
          <p className="text-sm text-gray-600 mb-6">Configure the bottom navigation bar for mobile devices</p>
          
          <div className="grid grid-cols-5 gap-4">
            {['Home', 'Categories', 'Cart', 'Account', 'More'].map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className={`ri-${['home', 'apps', 'shopping-cart', 'user', 'menu'][index]}-line text-xl text-teal-600`}></i>
                </div>
                <p className="text-sm font-medium text-gray-900">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Menu Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="text"
                    value={editingItem.url}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setEditingMenu(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingMenu === 'header') {
                      setHeaderMenu(headerMenu.map(item => 
                        item.id === editingItem.id ? editingItem : item
                      ));
                    } else {
                      setFooterMenu(footerMenu.map(item => 
                        item.id === editingItem.id ? editingItem : item
                      ));
                    }
                    setEditingItem(null);
                    setEditingMenu(null);
                  }}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
