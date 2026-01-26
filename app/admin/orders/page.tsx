'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const [orders, setOrders] = useState([
    {
      id: 'ORD-2024-324',
      customer: { name: 'Ama Osei', email: 'ama.osei@example.com', avatar: 'AO' },
      date: 'Dec 20, 2024 10:30 AM',
      items: 2,
      total: 450.00,
      status: 'Processing',
      payment: 'Moolre',
      shipping: 'Express'
    },
    {
      id: 'ORD-2024-323',
      customer: { name: 'Kwame Mensah', email: 'kwame.m@example.com', avatar: 'KM' },
      date: 'Dec 20, 2024 09:15 AM',
      items: 1,
      total: 289.00,
      status: 'Shipped',
      payment: 'Paystack',
      shipping: 'Standard'
    },
    {
      id: 'ORD-2024-322',
      customer: { name: 'Efua Asante', email: 'efua.asante@example.com', avatar: 'EA' },
      date: 'Dec 19, 2024 04:20 PM',
      items: 3,
      total: 678.00,
      status: 'Delivered',
      payment: 'Cash on Delivery',
      shipping: 'Standard'
    },
    {
      id: 'ORD-2024-321',
      customer: { name: 'Kofi Adjei', email: 'kofi.adjei@example.com', avatar: 'KA' },
      date: 'Dec 19, 2024 02:45 PM',
      items: 1,
      total: 195.00,
      status: 'Pending',
      payment: 'Moolre',
      shipping: 'Express'
    },
    {
      id: 'ORD-2024-320',
      customer: { name: 'Abena Mensah', email: 'abena.m@example.com', avatar: 'AM' },
      date: 'Dec 19, 2024 11:30 AM',
      items: 4,
      total: 824.00,
      status: 'Processing',
      payment: 'Paystack',
      shipping: 'Store Pickup'
    },
    {
      id: 'ORD-2024-319',
      customer: { name: 'Yaw Boateng', email: 'yaw.b@example.com', avatar: 'YB' },
      date: 'Dec 18, 2024 05:10 PM',
      items: 2,
      total: 387.00,
      status: 'Shipped',
      payment: 'Moolre',
      shipping: 'Standard'
    },
    {
      id: 'ORD-2024-318',
      customer: { name: 'Akosua Darko', email: 'akosua.d@example.com', avatar: 'AD' },
      date: 'Dec 18, 2024 01:25 PM',
      items: 1,
      total: 156.00,
      status: 'Delivered',
      payment: 'Cash on Delivery',
      shipping: 'Standard'
    },
    {
      id: 'ORD-2024-317',
      customer: { name: 'Kwesi Amoako', email: 'kwesi.a@example.com', avatar: 'KA' },
      date: 'Dec 18, 2024 10:00 AM',
      items: 5,
      total: 1245.00,
      status: 'Processing',
      payment: 'Paystack',
      shipping: 'Express'
    },
    {
      id: 'ORD-2024-316',
      customer: { name: 'Adwoa Owusu', email: 'adwoa.o@example.com', avatar: 'AO' },
      date: 'Dec 17, 2024 03:40 PM',
      items: 2,
      total: 523.00,
      status: 'Cancelled',
      payment: 'Moolre',
      shipping: 'Express'
    },
    {
      id: 'ORD-2024-315',
      customer: { name: 'Fiifi Nkrumah', email: 'fiifi.n@example.com', avatar: 'FN' },
      date: 'Dec 17, 2024 12:15 PM',
      items: 3,
      total: 689.00,
      status: 'Delivered',
      payment: 'Paystack',
      shipping: 'Standard'
    }
  ]);

  const statusColors: any = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Shipped': 'bg-purple-100 text-purple-700 border-purple-200',
    'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200'
  };

  const orderStats = [
    { label: 'All Orders', count: 324, status: 'all' },
    { label: 'Pending', count: 45, status: 'Pending' },
    { label: 'Processing', count: 78, status: 'Processing' },
    { label: 'Shipped', count: 52, status: 'Shipped' },
    { label: 'Delivered', count: 142, status: 'Delivered' },
    { label: 'Cancelled', count: 7, status: 'Cancelled' }
  ];

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkAction = (action: string, newStatus?: string) => {
    if (newStatus) {
      setOrders(orders.map(order => 
        selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order
      ));
      setSelectedOrders([]);
      alert(`${selectedOrders.length} orders updated to ${newStatus}`);
    } else if (action === 'Export') {
      const csvContent = `Order ID,Customer,Email,Date,Items,Total,Status,Payment,Shipping\n${orders.filter(o => selectedOrders.includes(o.id)).map(o => `${o.id},${o.customer.name},${o.customer.email},${o.date},${o.items},${o.total},${o.status},${o.payment},${o.shipping}`).join('\n')}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected-orders.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleExportAll = () => {
    const csvContent = `Order ID,Customer,Email,Date,Items,Total,Status,Payment,Shipping\n${orders.map(o => `${o.id},${o.customer.name},${o.customer.email},${o.date},${o.items},${o.total},${o.status},${o.payment},${o.shipping}`).join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-orders.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = (orderId: string) => {
    alert(`Printing invoice for ${orderId}...`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <button onClick={handleExportAll} className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
          <i className="ri-download-line mr-2"></i>
          Export Orders
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {orderStats.map((stat) => (
          <button
            key={stat.status}
            onClick={() => setStatusFilter(stat.status)}
            className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
              statusFilter === stat.status
                ? 'border-emerald-700 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg w-5 h-5 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID, customer name, or email..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-filter-line mr-2"></i>
                Filters
              </button>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="total">Sort by Total</option>
                <option value="customer">Sort by Customer</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                <input type="date" className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 pr-8 border-2 border-gray-300 rounded-lg text-sm cursor-pointer">
                  <option>All Methods</option>
                  <option>Moolre</option>
                  <option>Paystack</option>
                  <option>Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Method</label>
                <select className="w-full px-3 py-2 pr-8 border-2 border-gray-300 rounded-lg text-sm cursor-pointer">
                  <option>All Methods</option>
                  <option>Standard</option>
                  <option>Express</option>
                  <option>Store Pickup</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {selectedOrders.length > 0 && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <p className="text-emerald-800 font-semibold">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('Mark as Processing', 'Processing')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Mark Processing
              </button>
              <button
                onClick={() => handleBulkAction('Mark as Shipped', 'Shipped')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => handleBulkAction('Export')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
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
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Items</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Payment</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-emerald-700 hover:text-emerald-800 font-semibold whitespace-nowrap cursor-pointer">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full font-semibold text-sm">
                        {order.customer.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 whitespace-nowrap">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 text-sm whitespace-nowrap">{order.date}</td>
                  <td className="py-4 px-4 text-gray-700">{order.items}</td>
                  <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">GH₵ {order.total.toFixed(2)}</td>
                  <td className="py-4 px-4 text-gray-700 text-sm whitespace-nowrap">{order.payment}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-eye-line text-lg w-4 h-4 flex items-center justify-center"></i>
                      </Link>
                      <button 
                        onClick={() => handlePrintInvoice(order.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-printer-line text-lg w-4 h-4 flex items-center justify-center"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-600">Showing 1-10 of 324 orders</p>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
              <i className="ri-arrow-left-s-line text-xl text-gray-600 w-5 h-5 flex items-center justify-center"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer">
              1
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700 cursor-pointer">
              2
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700 cursor-pointer">
              3
            </button>
            <span className="px-2 text-gray-600">...</span>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-700 cursor-pointer">
              33
            </button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
              <i className="ri-arrow-right-s-line text-xl text-gray-600 w-5 h-5 flex items-center justify-center"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
