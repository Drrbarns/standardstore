'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: 'ri-settings-3-line' },
    { id: 'store', label: 'Store Details', icon: 'ri-store-line' },
    { id: 'payments', label: 'Payment Methods', icon: 'ri-bank-card-line' },
    { id: 'shipping', label: 'Shipping', icon: 'ri-truck-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
    { id: 'security', label: 'Security', icon: 'ri-shield-check-line' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your store configuration and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
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
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Site Title
                    </label>
                    <input
                      type="text"
                      defaultValue="EleganceMart"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Site Description
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      defaultValue="Your destination for premium home essentials and lifestyle products"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Currency
                      </label>
                      <select className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer">
                        <option>GHS - Ghanaian Cedi (GH₵)</option>
                        <option>USD - US Dollar ($)</option>
                        <option>EUR - Euro (€)</option>
                        <option>GBP - British Pound (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Time Zone
                      </label>
                      <select className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer">
                        <option>GMT (Africa/Accra)</option>
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Store Information</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      defaultValue="EleganceMart"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        defaultValue="hello@elegancemart.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="+233 30 123 4567"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Store Address
                    </label>
                    <input
                      type="text"
                      defaultValue="123 Independence Avenue"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3"
                      placeholder="Street Address"
                    />
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        defaultValue="Accra"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        defaultValue="Greater Accra"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Region"
                      />
                      <input
                        type="text"
                        defaultValue="GA-123-4567"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Postal Code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+233 24 567 8901"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        placeholder="@elegancemart"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        placeholder="@elegancemart"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Twitter
                      </label>
                      <input
                        type="text"
                        placeholder="@elegancemart"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Methods</h3>
                <p className="text-gray-600">Configure payment options for your customers</p>
              </div>

              <div className="space-y-4 max-w-3xl">
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                        <i className="ri-bank-card-line text-2xl text-blue-700"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Moolre</h4>
                        <p className="text-sm text-gray-600">Ghana mobile money payments</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="API Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Secret Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-lg">
                        <i className="ri-bank-card-2-line text-2xl text-emerald-700"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Paystack</h4>
                        <p className="text-sm text-gray-600">Cards and mobile money</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Public Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Secret Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg">
                        <i className="ri-wallet-line text-2xl text-amber-700"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Flutterwave</h4>
                        <p className="text-sm text-gray-600">Multiple payment options</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Public Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Secret Key"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                        <i className="ri-money-dollar-circle-line text-2xl text-gray-700"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">Pay when you receive</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Save Payment Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Shipping Configuration</h3>
                <p className="text-gray-600">Set up shipping zones and rates</p>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Standard Delivery</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time</label>
                      <input type="text" defaultValue="5-7 business days" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cost (GH₵)</label>
                      <input type="number" defaultValue="15.00" step="0.01" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Express Delivery</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time</label>
                      <input type="text" defaultValue="2-3 business days" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cost (GH₵)</label>
                      <input type="number" defaultValue="30.00" step="0.01" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Store Pickup</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                      <input type="text" defaultValue="Ready in 2-4 hours" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cost (GH₵)</label>
                      <input type="number" defaultValue="0.00" step="0.01" className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Free Shipping Threshold</h4>
                <div className="flex items-center space-x-4">
                  <input type="number" defaultValue="100.00" step="0.01" className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg text-sm" />
                  <span className="text-blue-900">Offer free shipping on orders above this amount</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Save Shipping Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Notifications</h3>
                <p className="text-gray-600">Configure when to send notification emails</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Order Confirmation</p>
                    <p className="text-sm text-gray-600">Send email when order is placed</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Order Shipped</p>
                    <p className="text-sm text-gray-600">Notify customer when order ships</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Order Delivered</p>
                    <p className="text-sm text-gray-600">Confirm delivery with customer</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">Alert admin when stock is low</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">New Customer</p>
                    <p className="text-sm text-gray-600">Notify when new customer registers</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Promotional Emails</p>
                    <p className="text-sm text-gray-600">Send marketing and promotional emails</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Security Settings</h3>
                <p className="text-gray-600">Manage security and access controls</p>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                    <input type="password" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                    <input type="password" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                    <input type="password" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Two-Factor Authentication</h4>
                <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
                  Enable 2FA
                </button>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Current Session</p>
                      <p className="text-xs text-gray-600">Chrome on Windows - Accra, Ghana</p>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
