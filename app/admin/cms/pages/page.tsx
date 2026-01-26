'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  updated_at: string;
}

export default function PagesEditor() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'published'
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      if (data) setPages(data);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      status: page.status as string
    });
    setIsNew(false);
  };

  const handleCreateNew = () => {
    setSelectedPage(null); // Deselect to show consistent UI
    setFormData({
      title: '',
      slug: '',
      content: '',
      status: 'draft'
    });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert('Title and Slug are required');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        status: formData.status,
        updated_at: new Date().toISOString()
      };

      if (isNew) {
        const { error } = await supabase.from('pages').insert([payload]);
        if (error) throw error;
        alert('Page created successfully');
      } else if (selectedPage) {
        const { error } = await supabase.from('pages').update(payload).eq('id', selectedPage.id);
        if (error) throw error;
        alert('Page updated successfully');
      }

      fetchPages();
      if (isNew) setIsNew(false); // Reset new state

    } catch (err: any) {
      alert('Error saving page: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage || isNew) return;
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        const { error } = await supabase.from('pages').delete().eq('id', selectedPage.id);
        if (error) throw error;
        setSelectedPage(null);
        setIsNew(false);
        fetchPages();
      } catch (err: any) {
        alert('Error deleting page: ' + err.message);
      }
    }
  };

  // Simple auto-slug
  useEffect(() => {
    if (isNew && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  }, [formData.title, isNew]);

  // Editor toolbar actions (Mock implementation for now)
  const insertText = (tag: string) => {
    setFormData(prev => ({ ...prev, content: prev.content + tag }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages Editor</h1>
            <p className="text-gray-600 mt-2">Create and edit static content pages</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap font-medium"
          >
            <i className="ri-add-line mr-2"></i>
            Create New Page
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-[calc(100vh-200px)] overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">All Pages</h2>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Loading pages...</div>
                ) : (
                  pages.map((page) => (
                    <div
                      key={page.id}
                      onClick={() => handleSelectPage(page)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${selectedPage?.id === page.id && !isNew
                          ? 'bg-teal-50 border-2 border-teal-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
                          <i className="ri-file-text-line text-teal-600"></i>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-gray-900 truncate">{page.title}</p>
                          <p className="text-xs text-gray-500 truncate">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded capitalize ${page.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {page.status}
                        </span>
                        <span className="text-gray-500">
                          {new Date(page.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {(selectedPage || isNew) ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isNew ? 'New Page' : 'Edit Page'}
                    </h2>
                    {!isNew && <p className="text-sm text-gray-600 mt-1">ID: {selectedPage?.id}</p>}
                  </div>
                  <div className="flex gap-2">
                    {!isNew && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center"
                    >
                      {saving ? <i className="ri-loader-4-line animate-spin mr-2"></i> : <i className="ri-save-line mr-2"></i>}
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g. About Us"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500 text-sm">/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="about-us"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content (HTML Support)</label>
                    <div className="border border-gray-300 rounded-lg mb-2 overflow-hidden">
                      <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50 flex-wrap">
                        <button onClick={() => insertText('<b></b>')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors" title="Bold"><i className="ri-bold"></i></button>
                        <button onClick={() => insertText('<i></i>')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors" title="Italic"><i className="ri-italic"></i></button>
                        <button onClick={() => insertText('<h2></h2>')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors" title="Heading 2"><i className="ri-h-2"></i></button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button onClick={() => insertText('<ul><li></li></ul>')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors" title="List"><i className="ri-list-unordered"></i></button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button onClick={() => insertText('<p></p>')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors" title="Paragraph"><i className="ri-paragraph"></i></button>
                      </div>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={15}
                        placeholder="<p>Write your content here...</p>"
                        className="w-full px-4 py-3 focus:outline-none resize-none font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Note: This is a raw HTML editor. You can type HTML directly or use the buttons to insert tags.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <i className="ri-pages-line text-4xl text-teal-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Your Pages</h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-8">Select a page from the list to edit its content, or create a new page to add to your website.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Create New Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
