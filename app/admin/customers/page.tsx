'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const customers = [
    {
      id: 1,
      name: 'Ama Osei',
      email: 'ama.osei@example.com',
      phone: '+233 24 123 4567',
      avatar: 'AO',
      orders: 12,
      totalSpent: 3456.00,
      joined: 'Mar 15, 2024',
      lastOrder: '2 days ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Kwame Mensah',
      email: 'kwame.m@example.com',
      phone: '+233 50 234 5678',
      avatar: 'KM',
      orders: 8,
      totalSpent: 2187.00,
      joined: 'Apr 22, 2024',
      lastOrder: '5 days ago',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Efua Asante',
      email: 'efua.asante@example.com',
      phone: '+233 27 345 6789',
      avatar: 'EA',
      orders: 15,
      totalSpent: 4892.00,
      joined: 'Feb 8, 2024',
      lastOrder: '1 day ago',
      status: 'VIP'
    },
    {
      id: 4,
      name: 'Kofi Adjei',
      email: 'kofi.adjei@example.com',
      phone: '+233 55 456 7890',
      avatar: 'KA',
      orders: 3,
      totalSpent: 687.00,
      joined: 'Nov 10, 2024',
      lastOrder: '1 week ago',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Abena Mensah',
      email: 'abena.m@example.com',
      phone: '+233 20 567 8901',
      avatar: 'AM',
      orders: 24,
      totalSpent: 7845.00,
      joined: 'Jan 5, 2024',
      lastOrder: 'Today',
      status: 'VIP'
    },
    {
      id: 6,
      name: 'Yaw Boateng',
      email: 'yaw.b@example.com',
      phone: '+233 24 678 9012',
      avatar: 'YB',
      orders: 6,
      totalSpent: 1523.00,
      joined: 'May 18, 2024',
      lastOrder: '3 days ago',
      status: 'Active'
    },
    {
      id: 7,
      name: 'Akosua Darko',
      email: 'akosua.d@example.com',
      phone: '+233 50 789 0123',
      avatar: 'AD',
      orders: 1,
      totalSpent: 156.00,
      joined: 'Dec 15, 2024',
      lastOrder: '2 weeks ago',
      status: 'New'
    },
    {
      id: 8,
      name: 'Kwesi Amoako',
      email: 'kwesi.a@example.com',
      phone: '+233 27 890 1234',
      avatar: 'KA',
      orders: 18,
      totalSpent: 5234.00,
      joined: 'Mar 1, 2024',
      lastOrder: 'Yesterday',
      status: 'VIP'
    }
  ];

  const statusColors: any = {
    'New': 'bg-blue-100 text-blue-700',
    'Active': 'bg-emerald-100 text-emerald-700',
    'VIP': 'bg-purple-100 text-purple-700',
    'Inactive': 'bg-gray-100 text-gray-700'
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer base and relationships</p>
        </div>
        <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
          <i className="ri-download-line mr-2"></i>
          Export Customers
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">1,842</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">New This Month</p>
          <p className="text-2xl font-bold text-emerald-700">127</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">VIP Customers</p>
          <p className="text-2xl font-bold text-purple-700">89</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Lifetime Value</p>
          <p className="text-2xl font-bold text-gray-900">GH₵ 2.8K</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select className="px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer">
                <option>All Customers</option>
                <option>New</option>
                <option>Active</option>
                <option>VIP</option>
                <option>Inactive</option>
              </select>
              <select className="px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer">
                <option>Sort by Name</option>
                <option>Sort by Orders</option>
                <option>Sort by Spent</option>
                <option>Sort by Join Date</option>
              </select>
            </div>
          </div>
        </div>

        {selectedCustomers.length > 0 && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <p className="text-emerald-800 font-semibold">
              {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-mail-line mr-2"></i>
                Send Email
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-vip-crown-line mr-2"></i>
                Mark as VIP
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-download-line mr-2"></i>
                Export
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === customers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Orders</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Last Order</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        {customer.avatar}
                      </div>
                      <div>
                        <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-gray-900 hover:text-emerald-700 whitespace-nowrap">
                          {customer.name}
                        </Link>
                        <p className="text-sm text-gray-500">Joined {customer.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700 text-sm">{customer.email}</p>
                    <p className="text-gray-600 text-sm">{customer.phone}</p>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">{customer.orders}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-700 whitespace-nowrap">GH₵ {customer.totalSpent.toFixed(2)}</td>
                  <td className="py-4 px-4 text-gray-700 text-sm whitespace-nowrap">{customer.lastOrder}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[customer.status]}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <i className="ri-eye-line text-lg"></i>
                      </Link>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                        <i className="ri-mail-line text-lg"></i>
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

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-600">Showing 1-8 of 1,842 customers</p>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <i className="ri-arrow-left-s-line text-xl text-gray-600"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-emerald-700 text-white rounded-lg font-semibold">1</button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700">2</button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700">3</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700">231</button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <i className="ri-arrow-right-s-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
