'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface Recipient {
  email: string | null;
  phone: string | null;
  name: string;
}

type AudienceType =
  | 'all'
  | 'abandoned_carts'
  | 'paid_customers'
  | 'repeat_buyers'
  | 'recent_customers'
  | 'inactive_customers'
  | 'high_spenders'
  | 'by_region'
  | 'by_product'
  | 'by_category'
  | 'custom';

interface AudienceOption {
  value: AudienceType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { value: 'all', label: 'All Customers', description: 'Every customer in your database', icon: 'ri-group-line', color: 'emerald' },
  { value: 'abandoned_carts', label: 'Abandoned Carts', description: 'Customers who didn\'t complete payment', icon: 'ri-shopping-cart-2-line', color: 'amber' },
  { value: 'paid_customers', label: 'Paid Customers', description: 'Customers with at least one paid order', icon: 'ri-checkbox-circle-line', color: 'green' },
  { value: 'repeat_buyers', label: 'Repeat Buyers', description: 'Customers with 2+ paid orders', icon: 'ri-repeat-line', color: 'blue' },
  { value: 'recent_customers', label: 'Recent Customers', description: 'Ordered in the last 30 days', icon: 'ri-time-line', color: 'purple' },
  { value: 'inactive_customers', label: 'Inactive Customers', description: 'Haven\'t ordered in 60+ days', icon: 'ri-zzz-line', color: 'gray' },
  { value: 'high_spenders', label: 'High Spenders', description: 'Top customers by total spending', icon: 'ri-vip-crown-line', color: 'yellow' },
  { value: 'by_region', label: 'By Region', description: 'Target a specific region', icon: 'ri-map-pin-line', color: 'red' },
  { value: 'by_product', label: 'By Product', description: 'Customers who bought a specific product', icon: 'ri-box-3-line', color: 'indigo' },
  { value: 'by_category', label: 'By Category', description: 'Customers who bought from a category', icon: 'ri-price-tag-3-line', color: 'pink' },
  { value: 'custom', label: 'Custom List', description: 'Paste phone numbers or emails manually', icon: 'ri-edit-line', color: 'slate' },
];

const SMS_MAX_LENGTH = 160;

export default function MarketingHub() {
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });

  const [audience, setAudience] = useState<AudienceType>('all');
  const [subFilter, setSubFilter] = useState('');
  const [channels, setChannels] = useState({ email: false, sms: true });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [customList, setCustomList] = useState('');
  const [spendThreshold, setSpendThreshold] = useState(500);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [regions, setRegions] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [audienceCounts, setAudienceCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    loadFilters();
    loadAudienceCounts();
  }, []);

  async function loadFilters() {
    const [regionsRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from('orders').select('shipping_address').not('shipping_address', 'is', null),
      supabase.from('products').select('name').eq('status', 'active').order('name'),
      supabase.from('categories').select('name').order('name'),
    ]);

    const regionSet = new Set<string>();
    (regionsRes.data || []).forEach((o: any) => {
      const r = o.shipping_address?.region?.trim();
      if (r && r.length > 2 && !/^\w{3,4}$/.test(r)) regionSet.add(r);
    });
    const cleanRegions = Array.from(regionSet).sort();
    const deduped = cleanRegions.filter(r => {
      const lower = r.toLowerCase().replace(/\s+/g, '');
      return !cleanRegions.some(other => other !== r && other.toLowerCase().replace(/\s+/g, '') === lower && other.length > r.length);
    });
    setRegions(deduped);
    setProducts((productsRes.data || []).map((p: any) => p.name));
    setCategories((categoriesRes.data || []).map((c: any) => c.name));
  }

  async function loadAudienceCounts() {
    setCountsLoading(true);
    try {
      const [customersRes, ordersRes] = await Promise.all([
        supabase.from('customers').select('id, email, phone, total_orders, total_spent, last_order_at'),
        supabase.from('orders').select('email, phone, payment_status, shipping_address').eq('payment_status', 'pending'),
      ]);

      const customers = customersRes.data || [];
      const abandonedOrders = ordersRes.data || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const abandonedEmails = new Set(abandonedOrders.map((o: any) => o.email?.toLowerCase()).filter(Boolean));

      const counts: Record<string, number> = {
        all: customers.length,
        abandoned_carts: abandonedEmails.size,
        paid_customers: customers.filter(c => (c.total_orders || 0) >= 1).length,
        repeat_buyers: customers.filter(c => (c.total_orders || 0) >= 2).length,
        recent_customers: customers.filter(c => c.last_order_at && new Date(c.last_order_at) >= thirtyDaysAgo).length,
        inactive_customers: customers.filter(c => c.last_order_at && new Date(c.last_order_at) < sixtyDaysAgo).length,
        high_spenders: customers.filter(c => (c.total_spent || 0) >= 500).length,
      };
      setAudienceCounts(counts);
    } catch (e) {
      console.error('Error loading audience counts:', e);
    }
    setCountsLoading(false);
  }

  async function loadRecipients() {
    setLoadingRecipients(true);
    setRecipients([]);
    setError('');

    try {
      if (audience === 'custom') {
        const lines = customList.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
        const parsed: Recipient[] = lines.map(line => {
          const isEmail = line.includes('@');
          return { email: isEmail ? line : null, phone: !isEmail ? line : null, name: line };
        });
        setRecipients(parsed);
        setLoadingRecipients(false);
        return;
      }

      if (audience === 'abandoned_carts') {
        let allAbandoned: any[] = [];
        let from = 0;
        const batchSize = 1000;
        while (true) {
          const { data, error: e } = await supabase
            .from('orders')
            .select('email, phone, shipping_address')
            .eq('payment_status', 'pending')
            .range(from, from + batchSize - 1);
          if (e) throw e;
          if (!data || data.length === 0) break;
          allAbandoned = allAbandoned.concat(data);
          if (data.length < batchSize) break;
          from += batchSize;
        }

        const seen = new Set<string>();
        const result: Recipient[] = [];
        for (const o of allAbandoned) {
          const key = (o.email || o.phone || '').toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          const addr = o.shipping_address || {};
          const name = [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || o.email?.split('@')[0] || 'Customer';
          result.push({ email: o.email, phone: o.phone, name });
        }

        if (subFilter) {
          const regionLower = subFilter.toLowerCase();
          setRecipients(result.filter(r => {
            const order = allAbandoned.find(o => (o.email || o.phone) === (r.email || r.phone));
            return order?.shipping_address?.region?.toLowerCase().includes(regionLower);
          }));
        } else {
          setRecipients(result);
        }
        setLoadingRecipients(false);
        return;
      }

      // All other audiences: query from customers table
      let query = supabase.from('customers').select('email, phone, full_name, total_orders, total_spent, last_order_at, default_address, secondary_phone, secondary_email');

      const { data: customers, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      let filtered = customers || [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      switch (audience) {
        case 'paid_customers':
          filtered = filtered.filter(c => (c.total_orders || 0) >= 1);
          break;
        case 'repeat_buyers':
          filtered = filtered.filter(c => (c.total_orders || 0) >= 2);
          break;
        case 'recent_customers':
          filtered = filtered.filter(c => c.last_order_at && new Date(c.last_order_at) >= thirtyDaysAgo);
          break;
        case 'inactive_customers':
          filtered = filtered.filter(c => c.last_order_at && new Date(c.last_order_at) < sixtyDaysAgo);
          break;
        case 'high_spenders':
          filtered = filtered.filter(c => (c.total_spent || 0) >= spendThreshold);
          break;
        case 'by_region':
          if (subFilter) {
            const regionLower = subFilter.toLowerCase();
            filtered = filtered.filter(c => {
              const addr = c.default_address as any;
              return addr?.region?.toLowerCase().includes(regionLower);
            });
          }
          break;
      }

      if (audience === 'by_product' && subFilter) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('order_id, product_name')
          .eq('product_name', subFilter);

        if (orderItems && orderItems.length > 0) {
          const orderIds = [...new Set(orderItems.map(i => i.order_id))];
          let allOrders: any[] = [];
          for (let i = 0; i < orderIds.length; i += 200) {
            const chunk = orderIds.slice(i, i + 200);
            const { data: orders } = await supabase
              .from('orders')
              .select('email')
              .in('id', chunk);
            if (orders) allOrders = allOrders.concat(orders);
          }
          const emails = new Set(allOrders.map(o => o.email?.toLowerCase()).filter(Boolean));
          filtered = filtered.filter(c => emails.has(c.email?.toLowerCase()));
        } else {
          filtered = [];
        }
      }

      if (audience === 'by_category' && subFilter) {
        const { data: catProducts } = await supabase
          .from('products')
          .select('name, categories!inner(name)')
          .eq('categories.name', subFilter);

        if (catProducts && catProducts.length > 0) {
          const productNames = catProducts.map((p: any) => p.name);
          let allItems: any[] = [];
          for (let i = 0; i < productNames.length; i += 20) {
            const chunk = productNames.slice(i, i + 20);
            const { data: items } = await supabase
              .from('order_items')
              .select('order_id')
              .in('product_name', chunk);
            if (items) allItems = allItems.concat(items);
          }
          const orderIds = [...new Set(allItems.map(i => i.order_id))];
          let allOrders: any[] = [];
          for (let i = 0; i < orderIds.length; i += 200) {
            const chunk = orderIds.slice(i, i + 200);
            const { data: orders } = await supabase.from('orders').select('email').in('id', chunk);
            if (orders) allOrders = allOrders.concat(orders);
          }
          const emails = new Set(allOrders.map(o => o.email?.toLowerCase()).filter(Boolean));
          filtered = filtered.filter(c => emails.has(c.email?.toLowerCase()));
        } else {
          filtered = [];
        }
      }

      // Deduplicate
      const seenPhones = new Set<string>();
      const seenEmails = new Set<string>();
      const normalizePhone = (p: string) => p.replace(/[\s\-\(\)\.]+/g, '').replace(/^00/, '+');

      const result: Recipient[] = [];
      for (const c of filtered) {
        const phones = [c.phone, c.secondary_phone].filter(Boolean).map(normalizePhone);
        const emails = [c.email, c.secondary_email].filter(Boolean).map((e: string) => e.toLowerCase().trim());

        const uniquePhone = phones.find(p => !seenPhones.has(p)) || null;
        if (uniquePhone) seenPhones.add(uniquePhone);
        const uniqueEmail = emails.find(e => !seenEmails.has(e)) || null;
        if (uniqueEmail) seenEmails.add(uniqueEmail);
        phones.forEach(p => seenPhones.add(p));
        emails.forEach(e => seenEmails.add(e));

        const recipient: Recipient = { email: uniqueEmail, phone: uniquePhone, name: c.full_name || 'Customer' };
        if (channels.sms && !channels.email && !recipient.phone) continue;
        if (channels.email && !channels.sms && !recipient.email) continue;
        if (!recipient.email && !recipient.phone) continue;
        result.push(recipient);
      }

      setRecipients(result);
    } catch (err: any) {
      setError('Failed to load recipients: ' + err.message);
    }
    setLoadingRecipients(false);
  }

  useEffect(() => {
    if (audience !== 'custom') {
      loadRecipients();
    }
  }, [audience, subFilter, channels.sms, channels.email, spendThreshold]);

  const smsCount = useMemo(() => recipients.filter(r => r.phone).length, [recipients]);
  const emailCount = useMemo(() => recipients.filter(r => r.email).length, [recipients]);
  const smsSegments = Math.ceil(message.length / SMS_MAX_LENGTH) || 1;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) { setError('No recipients to send to'); return; }
    if (!channels.email && !channels.sms) { setError('Select at least one channel'); return; }
    if (!message.trim()) { setError('Message content is required'); return; }

    const summaryParts = [];
    if (channels.sms) summaryParts.push(`${smsCount} SMS`);
    if (channels.email) summaryParts.push(`${emailCount} emails`);
    if (!window.confirm(`Send ${summaryParts.join(' and ')} to ${recipients.length} recipients?\n\nThis action cannot be undone.`)) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setSendProgress({ current: 0, total: recipients.length });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('You must be logged in as admin');

      const BATCH_SIZE = 50;
      let totalEmail = 0, totalSms = 0, totalErrors = 0;

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);
        setSendProgress({ current: Math.min(i + BATCH_SIZE, recipients.length), total: recipients.length });

        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            type: 'campaign',
            payload: { recipients: batch, subject, message, channels }
          })
        });

        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Server error (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${text.slice(0, 100)}`);
        }
        if (!res.ok) throw new Error(data.error || 'Failed to send');

        const msg = data.message || '';
        const emailMatch = msg.match(/(\d+) emails/);
        const smsMatch = msg.match(/(\d+) SMS/);
        const errorMatch = msg.match(/(\d+) failed/);
        if (emailMatch) totalEmail += parseInt(emailMatch[1]);
        if (smsMatch) totalSms += parseInt(smsMatch[1]);
        if (errorMatch) totalErrors += parseInt(errorMatch[1]);
      }

      const resultParts = [];
      if (totalEmail > 0) resultParts.push(`${totalEmail} emails`);
      if (totalSms > 0) resultParts.push(`${totalSms} SMS`);
      const errorNote = totalErrors > 0 ? ` (${totalErrors} failed)` : '';
      setSuccess(`Campaign sent! ${resultParts.join(' and ')} delivered.${errorNote}`);
      setMessage('');
      setSubject('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSendProgress({ current: 0, total: 0 });
    }
  };

  const selectedOption = AUDIENCE_OPTIONS.find(o => o.value === audience)!;
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500 bg-emerald-50', amber: 'border-amber-500 bg-amber-50',
    green: 'border-green-500 bg-green-50', blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50', gray: 'border-gray-500 bg-gray-50',
    yellow: 'border-yellow-500 bg-yellow-50', red: 'border-red-500 bg-red-50',
    indigo: 'border-indigo-500 bg-indigo-50', pink: 'border-pink-500 bg-pink-50',
    slate: 'border-slate-500 bg-slate-50',
  };
  const iconColorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-100', amber: 'text-amber-600 bg-amber-100',
    green: 'text-green-600 bg-green-100', blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100', gray: 'text-gray-600 bg-gray-100',
    yellow: 'text-yellow-600 bg-yellow-100', red: 'text-red-600 bg-red-100',
    indigo: 'text-indigo-600 bg-indigo-100', pink: 'text-pink-600 bg-pink-100',
    slate: 'text-slate-600 bg-slate-100',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
          <p className="text-gray-500 mt-1">Send targeted SMS & email campaigns to your customers</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <i className="ri-group-line text-emerald-600" />
            <span className="text-gray-600">Total Customers:</span>
            <span className="font-bold text-gray-900">{audienceCounts.all || '...'}</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
          <i className="ri-checkbox-circle-fill text-xl mt-0.5" />
          <div><p className="font-semibold">Campaign Sent!</p><p className="text-sm mt-0.5">{success}</p></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <i className="ri-error-warning-fill text-xl mt-0.5" />
          <div><p className="font-semibold">Error</p><p className="text-sm mt-0.5">{error}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Audience Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audience Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-focus-3-line text-emerald-600" /> Select Audience
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AUDIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setAudience(opt.value); setSubFilter(''); setShowPreview(false); }}
                  className={`relative text-left p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                    audience === opt.value ? colorMap[opt.color] : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    audience === opt.value ? iconColorMap[opt.color] : 'text-gray-400 bg-gray-50 group-hover:bg-gray-100'
                  }`}>
                    <i className={`${opt.icon} text-lg`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{opt.description}</p>
                  {audienceCounts[opt.value] !== undefined && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {audienceCounts[opt.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-filters */}
          {(audience === 'by_region' || audience === 'by_product' || audience === 'by_category' || audience === 'high_spenders') && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <i className="ri-filter-3-line text-gray-400" /> Filter
              </h3>
              {audience === 'by_region' && (
                <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option value="">Select a region...</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
              {audience === 'by_product' && (
                <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option value="">Select a product...</option>
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
              {audience === 'by_category' && (
                <select value={subFilter} onChange={e => setSubFilter(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                  <option value="">Select a category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              {audience === 'high_spenders' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Minimum Total Spent (GH₵)</label>
                  <input type="number" value={spendThreshold} onChange={e => setSpendThreshold(Number(e.target.value))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min={0} step={100} />
                </div>
              )}
            </div>
          )}

          {/* Custom List Input */}
          {audience === 'custom' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Paste Phone Numbers or Emails</h3>
              <textarea
                value={customList}
                onChange={e => setCustomList(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg h-32 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0551234567&#10;0241234567&#10;customer@email.com&#10;&#10;One per line, or comma/semicolon separated"
              />
              <button onClick={loadRecipients} className="mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                <i className="ri-check-line mr-1" /> Parse List ({customList.split(/[\n,;]+/).filter(l => l.trim()).length} entries)
              </button>
            </div>
          )}

          {/* Compose Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="ri-quill-pen-line text-emerald-600" /> Compose Message
            </h2>

            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={channels.sms}
                  onChange={e => setChannels({ ...channels, sms: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                <span className="font-medium text-gray-900 text-sm"><i className="ri-message-2-line mr-1" />SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={channels.email}
                  onChange={e => setChannels({ ...channels, email: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer" />
                <span className="font-medium text-gray-900 text-sm"><i className="ri-mail-line mr-1" />Email</span>
              </label>
            </div>

            {channels.email && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., New Arrivals Just Dropped!" required={channels.email} />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg h-36 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Type your message here..." required />
              {channels.sms && (
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={`${message.length > SMS_MAX_LENGTH ? 'text-amber-600' : 'text-gray-400'}`}>
                    {message.length}/{SMS_MAX_LENGTH} characters
                    {smsSegments > 1 && <span className="ml-1 font-medium">({smsSegments} SMS segments per recipient)</span>}
                  </span>
                  <span className="text-gray-400">
                    Est. cost: {smsSegments} x {smsCount} = {smsSegments * smsCount} SMS units
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary & Send */}
        <div className="space-y-6">
          {/* Audience Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Campaign Summary</h3>

            <div className={`p-4 rounded-lg border-2 mb-4 ${colorMap[selectedOption.color]}`}>
              <div className="flex items-center gap-2 mb-1">
                <i className={`${selectedOption.icon} ${iconColorMap[selectedOption.color].split(' ')[0]}`} />
                <span className="font-semibold text-gray-900 text-sm">{selectedOption.label}</span>
              </div>
              {(audience === 'by_region' || audience === 'by_product' || audience === 'by_category') && subFilter && (
                <p className="text-xs text-gray-600 mt-1"><i className="ri-filter-3-line mr-1" />{subFilter}</p>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Recipients</span>
                <span className="font-bold text-gray-900">
                  {loadingRecipients ? <i className="ri-loader-4-line animate-spin" /> : recipients.length}
                </span>
              </div>
              {channels.sms && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600"><i className="ri-message-2-line mr-1 text-emerald-500" />SMS</span>
                  <span className="font-bold text-emerald-700">{smsCount}</span>
                </div>
              )}
              {channels.email && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600"><i className="ri-mail-line mr-1 text-blue-500" />Email</span>
                  <span className="font-bold text-blue-700">{emailCount}</span>
                </div>
              )}
              {channels.sms && message.length > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">SMS Segments</span>
                  <span className="font-semibold text-gray-700">{smsSegments}</span>
                </div>
              )}
            </div>

            {/* Preview Toggle */}
            <button onClick={() => setShowPreview(!showPreview)}
              className="w-full mb-4 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2">
              <i className={`${showPreview ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
              {showPreview ? 'Hide' : 'Preview'} Recipients
            </button>

            {/* Send Button */}
            <form onSubmit={handleSend}>
              <button type="submit"
                disabled={loading || loadingRecipients || recipients.length === 0 || !message.trim() || (!channels.email && !channels.sms)}
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-base hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    Sending... ({sendProgress.current}/{sendProgress.total})
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-fill" />
                    Send Campaign
                  </>
                )}
              </button>
            </form>

            {recipients.length === 0 && !loadingRecipients && audience !== 'custom' && (
              <p className="text-xs text-gray-400 text-center mt-3">
                {(audience === 'by_region' || audience === 'by_product' || audience === 'by_category') && !subFilter
                  ? 'Select a filter above to load recipients'
                  : 'No recipients match this audience'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recipients Preview */}
      {showPreview && recipients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <i className="ri-user-search-line text-emerald-600" />
              Recipients Preview
              <span className="text-xs font-normal text-gray-500">({recipients.length} total)</span>
            </h3>
            <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <i className="ri-close-line text-lg" />
            </button>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">#</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Name</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Phone</th>
                  <th className="text-left py-2 px-4 text-xs font-semibold text-gray-500">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recipients.slice(0, 100).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 px-4 font-medium text-gray-900">{r.name}</td>
                    <td className="py-2 px-4 text-gray-600">{r.phone || '—'}</td>
                    <td className="py-2 px-4 text-gray-600">{r.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recipients.length > 100 && (
              <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                Showing first 100 of {recipients.length} recipients
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
