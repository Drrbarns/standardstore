'use client';

import { useState } from 'react';

export default function AdminCouponsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const coupons = [
    {
      id: 1,
      code: 'WELCOME10',
      type: 'Percentage',
      value: 10,
      minPurchase: 50.00,
      usageLimit: 100,
      usedCount: 47,
      startDate: 'Dec 1, 2024',
      endDate: 'Dec 31, 2024',
      status: 'Active'
    },
    {
      id: 2,
      code: 'FREESHIP',
      type: 'Free Shipping',
      value: 0,
      minPurchase: 100.00,
      usageLimit: 500,
      usedCount: 234,
      startDate: 'Dec 1, 2024',
      endDate: 'Jan 31, 2025',
      status: 'Active'
    },
    {
      id: 3,
      code: 'SAVE50',
      type: 'Fixed Amount',
      value: 50,
      minPurchase: 200.00,
      usageLimit: 50,
      usedCount: 50,
      startDate: 'Nov 15, 2024',
      endDate: 'Dec 15, 2024',
      status: 'Expired'
    },
    {
      id: 4,
      code: 'NEWYEAR25',
      type: 'Percentage',
      value: 25,
      minPurchase: 150.00,
      usageLimit: 200,
      usedCount: 0,
      startDate: 'Jan 1, 2025',
      endDate: 'Jan 7, 2025',
      status: 'Scheduled'
    },
    {
      id: 5,
      code: 'VIP15',
      type: 'Percentage',
      value: 15,
      minPurchase: 0,
      usageLimit: null,
      usedCount: 89,
      startDate: 'Jan 1, 2024',
      endDate: null,
      status: 'Active'
    },
    {
      id: 6,
      code: 'FLASH30',
      type: 'Percentage',
      value: 30,
      minPurchase: 100.00,
      usageLimit: 100,
      usedCount: 78,
      startDate: 'Dec 20, 2024',
      endDate: 'Dec 22, 2024',
      status: 'Active'
    }
  ];

  const statusColors: any = {
    'Active': 'bg-emerald-100 text-emerald-700',
    'Scheduled': 'bg-blue-100 text-blue-700',
    'Expired': 'bg-gray-100 text-gray-700',
    'Disabled': 'bg-red-100 text-red-700'
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons & Promotions</h1>
          <p className="text-gray-600 mt-1">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-700">{coupons.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Uses</p>
          <p className="text-2xl font-bold text-gray-900">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Discount</p>
          <p className="text-2xl font-bold text-purple-700">GH₵ 12.5K</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">All Coupons</h2>
            <div className="flex items-center space-x-3">
              <select className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer">
                <option>All Status</option>
                <option>Active</option>
                <option>Scheduled</option>
                <option>Expired</option>
              </select>
              <select className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer">
                <option>Sort by Date</option>
                <option>Sort by Usage</option>
                <option>Sort by Value</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Value</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Min Purchase</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Usage</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Valid Period</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">{coupon.code}</span>
                      <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors">
                        <i className="ri-file-copy-line"></i>
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{coupon.type}</td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    {coupon.type === 'Percentage' ? `${coupon.value}%` : coupon.type === 'Fixed Amount' ? `GH₵ ${coupon.value}` : 'Free Shipping'}
                  </td>
                  <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                    {coupon.minPurchase > 0 ? `GH₵ ${coupon.minPurchase.toFixed(2)}` : 'No minimum'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 font-semibold">{coupon.usedCount}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-600">{coupon.usageLimit || '∞'}</span>
                    </div>
                    {coupon.usageLimit && (
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700 whitespace-nowrap">{coupon.startDate}</p>
                    <p className="text-sm text-gray-500 whitespace-nowrap">{coupon.endDate || 'No expiry'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[coupon.status]}`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <i className="ri-edit-line text-lg"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
                        <i className="ri-pause-circle-line text-lg"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddModal ? 'Create New Coupon' : 'Edit Coupon'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingCoupon(null);
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  defaultValue={editingCoupon?.code || ''}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono uppercase"
                  placeholder="COUPONCODE"
                />
                <p className="text-sm text-gray-500 mt-2">Use uppercase letters and numbers only</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Discount Type *
                  </label>
                  <select
                    defaultValue={editingCoupon?.type || 'Percentage'}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                  >
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                    <option>Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    defaultValue={editingCoupon?.value || ''}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Minimum Purchase (GH₵)
                  </label>
                  <input
                    type="number"
                    defaultValue={editingCoupon?.minPurchase || ''}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500 mt-2">Leave 0 for no minimum</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    defaultValue={editingCoupon?.usageLimit || ''}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="100"
                  />
                  <p className="text-sm text-gray-500 mt-2">Leave empty for unlimited</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">Leave empty for no expiry</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Internal description for this coupon..."
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Advanced Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-blue-900">One use per customer</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-blue-900">First order only</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-blue-900">Exclude sale items</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingCoupon(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 font-semibold transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors whitespace-nowrap">
                {showAddModal ? 'Create Coupon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
