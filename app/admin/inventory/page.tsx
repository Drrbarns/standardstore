'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InventoryManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      sku: 'PWH-2024-001',
      category: 'Electronics',
      currentStock: 5,
      reorderLevel: 10,
      reorderQuantity: 50,
      price: 450.00,
      cost: 280.00,
      status: 'low',
      lastRestocked: '2024-12-15',
      supplier: 'TechWorld Supplies'
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      sku: 'SFW-2024-002',
      category: 'Electronics',
      currentStock: 45,
      reorderLevel: 15,
      reorderQuantity: 100,
      price: 320.00,
      cost: 200.00,
      status: 'good',
      lastRestocked: '2024-12-20',
      supplier: 'FitTech Distributors'
    },
    {
      id: '3',
      name: 'Leather Crossbody Bag',
      sku: 'LCB-2024-003',
      category: 'Fashion',
      currentStock: 0,
      reorderLevel: 8,
      reorderQuantity: 30,
      price: 289.00,
      cost: 180.00,
      status: 'out',
      lastRestocked: '2024-12-01',
      supplier: 'Luxury Accessories Co'
    },
    {
      id: '4',
      name: 'Organic Cotton T-Shirt',
      sku: 'OCT-2024-004',
      category: 'Fashion',
      currentStock: 125,
      reorderLevel: 30,
      reorderQuantity: 200,
      price: 89.00,
      cost: 45.00,
      status: 'good',
      lastRestocked: '2024-12-18',
      supplier: 'EcoWear Imports'
    },
    {
      id: '5',
      name: 'Ceramic Coffee Mug Set',
      sku: 'CCM-2024-005',
      category: 'Home & Living',
      currentStock: 12,
      reorderLevel: 20,
      reorderQuantity: 80,
      price: 125.00,
      cost: 65.00,
      status: 'low',
      lastRestocked: '2024-12-10',
      supplier: 'HomeStyle Warehouse'
    },
    {
      id: '6',
      name: 'Yoga Mat Premium',
      sku: 'YMP-2024-006',
      category: 'Sports',
      currentStock: 78,
      reorderLevel: 25,
      reorderQuantity: 150,
      price: 159.00,
      cost: 90.00,
      status: 'good',
      lastRestocked: '2024-12-22',
      supplier: 'ActiveLife Supplies'
    }
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = stockFilter === 'all' ||
                         (stockFilter === 'low' && product.status === 'low') ||
                         (stockFilter === 'out' && product.status === 'out') ||
                         (stockFilter === 'good' && product.status === 'good');
    return matchesSearch && matchesFilter;
  });

  const lowStockCount = products.filter(p => p.status === 'low').length;
  const outOfStockCount = products.filter(p => p.status === 'out').length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.cost), 0);

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkRestock = () => {
    const restockDate = new Date().toISOString().split('T')[0];
    setProducts(products.map(product => {
      if (selectedProducts.includes(product.id)) {
        return {
          ...product,
          currentStock: product.currentStock + product.reorderQuantity,
          status: 'good',
          lastRestocked: restockDate
        };
      }
      return product;
    }));
    setSelectedProducts([]);
  };

  const handleExportCSV = () => {
    const csvData = [
      ['SKU', 'Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Price', 'Cost', 'Status', 'Supplier'],
      ...products.map(p => [
        p.sku,
        p.name,
        p.category,
        p.currentStock.toString(),
        p.reorderLevel.toString(),
        p.price.toFixed(2),
        p.cost.toFixed(2),
        p.status,
        p.supplier
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Track stock levels, manage reorders, and forecast demand</p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                <i className="ri-stack-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-amber-600">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg">
                <i className="ri-alert-line text-2xl text-amber-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-lg">
                <i className="ri-close-circle-line text-2xl text-red-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Inventory Value</p>
                <p className="text-3xl font-bold text-emerald-600">GH₵{totalValue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-lg">
                <i className="ri-money-dollar-circle-line text-2xl text-emerald-600"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {['all', 'low', 'out', 'good'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStockFilter(filter)}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${
                      stockFilter === filter
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter === 'all' && 'All'}
                    {filter === 'low' && 'Low Stock'}
                    {filter === 'out' && 'Out of Stock'}
                    {filter === 'good' && 'In Stock'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowImportModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-upload-line"></i>
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-download-line"></i>
                <span>Export</span>
              </button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 font-medium">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkRestock}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
                >
                  Bulk Restock
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleAllProducts}
                      className="w-5 h-5 text-emerald-700 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-5 h-5 text-emerald-700 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.supplier}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-700">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{product.currentStock}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{product.reorderLevel}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        GH₵{(product.currentStock * product.cost).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.status === 'good' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          <i className="ri-checkbox-circle-fill mr-1"></i>
                          In Stock
                        </span>
                      )}
                      {product.status === 'low' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 whitespace-nowrap">
                          <i className="ri-alert-fill mr-1"></i>
                          Low Stock
                        </span>
                      )}
                      {product.status === 'out' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 whitespace-nowrap">
                          <i className="ri-close-circle-fill mr-1"></i>
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-700 transition-colors"
                          title="Edit"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <i className="ri-eye-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Import Inventory</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-emerald-100 rounded-full mx-auto mb-4">
                <i className="ri-file-upload-line text-3xl text-emerald-700"></i>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Drop your CSV file here</p>
              <p className="text-gray-600 mb-4">or click to browse</p>
              <input type="file" accept=".csv" className="hidden" id="csv-upload" />
              <label
                htmlFor="csv-upload"
                className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors whitespace-nowrap"
              >
                Choose File
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-xl text-blue-700 mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">CSV Format Requirements</p>
                  <p className="text-sm text-blue-700">
                    Required columns: SKU, Product Name, Category, Current Stock, Reorder Level, Price, Cost, Supplier
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Export Inventory</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Export all inventory data to a CSV file for backup or external analysis.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-700 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 rounded" />
                  <span className="text-gray-900">Include stock levels</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-700 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 rounded" />
                  <span className="text-gray-900">Include pricing data</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-700 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-700 rounded" />
                  <span className="text-gray-900">Include supplier information</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
