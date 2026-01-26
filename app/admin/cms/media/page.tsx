'use client';

import { useState } from 'react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: string;
  uploadedAt: string;
}

export default function MediaLibrary() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  const mediaFiles: MediaFile[] = [
    { id: '1', name: 'hero-banner.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=modern%20ecommerce%20hero%20banner%20with%20clean%20white%20background%20featuring%20lifestyle%20products%20professional%20photography%20minimal%20design&width=1200&height=600&seq=hero1&orientation=landscape', size: '2.4 MB', uploadedAt: '2 hours ago' },
    { id: '2', name: 'product-1.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=elegant%20product%20photography%20on%20pure%20white%20background%20minimalist%20modern%20style%20professional%20studio%20lighting&width=800&height=800&seq=prod1&orientation=squarish', size: '1.8 MB', uploadedAt: '5 hours ago' },
    { id: '3', name: 'product-2.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=luxury%20product%20display%20white%20background%20clean%20modern%20aesthetic%20professional%20commercial%20photography&width=800&height=800&seq=prod2&orientation=squarish', size: '2.1 MB', uploadedAt: '1 day ago' },
    { id: '4', name: 'banner-sale.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=promotional%20sale%20banner%20vibrant%20colors%20ecommerce%20modern%20design%20clean%20background%20attractive%20layout&width=1200&height=400&seq=sale1&orientation=landscape', size: '1.5 MB', uploadedAt: '2 days ago' },
    { id: '5', name: 'category-fashion.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=fashion%20category%20banner%20elegant%20lifestyle%20photography%20clean%20minimal%20background%20modern%20sophisticated&width=600&height=400&seq=cat1&orientation=landscape', size: '1.2 MB', uploadedAt: '3 days ago' },
    { id: '6', name: 'category-electronics.jpg', type: 'image', url: 'https://readdy.ai/api/search-image?query=electronics%20category%20banner%20technology%20products%20clean%20white%20background%20modern%20sleek%20design&width=600&height=400&seq=cat2&orientation=landscape', size: '1.4 MB', uploadedAt: '3 days ago' }
  ];

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev =>
      prev.includes(id) ? prev.filter(fileId => fileId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-2">Upload and manage all website images and media</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
              <i className="ri-folder-add-line mr-2"></i>
              New Folder
            </button>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap">
              <i className="ri-upload-cloud-line mr-2"></i>
              Upload Files
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search media..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
              <select className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>All Types</option>
                <option>Images</option>
                <option>Videos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('grid')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  view === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className="ri-grid-line text-xl"></i>
              </button>
              <button
                onClick={() => setView('list')}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  view === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className="ri-list-check text-xl"></i>
              </button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 p-4 bg-teal-50 rounded-lg flex items-center justify-between">
              <p className="text-sm text-teal-900">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>
                  Download
                </button>
                <button className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap">
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleFileSelection(file.id)}
                className={`bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedFiles.includes(file.id) ? 'border-teal-500' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedFiles.includes(file.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{file.size}</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mediaFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <img src={file.url} alt={file.name} className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.uploadedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-600 hover:text-teal-600 transition-colors">
                        <i className="ri-more-2-fill text-xl"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
