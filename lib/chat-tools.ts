// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  moq: number;
  inStock: boolean;
};

export type ChatOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  tracking_number?: string;
  items: { name: string; quantity: number; price: number }[];
};

export type ChatCoupon = {
  valid: boolean;
  code: string;
  reason?: string;
  type?: string;
  value?: number;
  minimum_purchase?: number;
  maximum_discount?: number;
  expires?: string;
};

export type ChatTicket = {
  id: string;
  ticket_number: number;
  status: string;
  subject: string;
};

export type ChatReturn = {
  id: string;
  status: string;
  order_number: string;
  reason: string;
};

export type ChatCustomerProfile = {
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
};

// ─── 1. Search Products (existing) ──────────────────────────────────────────

export async function searchProducts(
  supabase: any,
  query: string,
  limit = 4
): Promise<ChatProduct[]> {
  const term = (query || '').trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from('products')
    .select(`id, name, slug, price, quantity, metadata, product_images(url, position)`)
    .eq('status', 'active')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .order('name')
    .limit(limit);

  if (error) {
    console.error('[ChatTools] searchProducts error:', error);
    return [];
  }

  return (data || []).map(mapProduct);
}

// ─── 2. Get Product for Cart (existing) ─────────────────────────────────────

export async function getProductForCart(
  supabase: any,
  slugOrId: string
): Promise<ChatProduct | null> {
  if (!slugOrId?.trim()) return null;
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId.trim());

  const q = supabase
    .from('products')
    .select(`id, name, slug, price, quantity, metadata, product_images(url, position)`)
    .eq('status', 'active');

  const { data, error } = isId
    ? await q.eq('id', slugOrId).single()
    : await q.eq('slug', slugOrId).single();

  if (error || !data) return null;
  return mapProduct(data);
}

// ─── 3. Track Order ─────────────────────────────────────────────────────────

export async function trackOrder(
  supabase: any,
  orderNumber: string,
  email: string
): Promise<ChatOrder | null> {
  if (!orderNumber?.trim() || !email?.trim()) return null;

  const { data, error } = await supabase.rpc('get_order_for_tracking', {
    p_order_number: orderNumber.trim(),
    p_email: email.trim(),
  });

  if (error || !data || typeof data !== 'object') return null;

  return {
    id: data.id,
    order_number: data.order_number,
    status: data.status,
    payment_status: data.payment_status,
    total: Number(data.total),
    created_at: data.created_at,
    tracking_number: data.metadata?.tracking_number || undefined,
    items: (data.order_items || []).map((i: any) => ({
      name: i.product_name,
      quantity: i.quantity,
      price: Number(i.unit_price),
    })),
  };
}

// ─── 4. Get Customer Orders ─────────────────────────────────────────────────

export async function getCustomerOrders(
  supabase: any,
  userId: string,
  limit = 5
): Promise<ChatOrder[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, payment_status, total, created_at, metadata,
      order_items(product_name, quantity, unit_price)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    status: o.status,
    payment_status: o.payment_status,
    total: Number(o.total),
    created_at: o.created_at,
    tracking_number: o.metadata?.tracking_number || undefined,
    items: (o.order_items || []).map((i: any) => ({
      name: i.product_name,
      quantity: i.quantity,
      price: Number(i.unit_price),
    })),
  }));
}

// ─── 5. Check Coupon ────────────────────────────────────────────────────────

export async function checkCoupon(
  supabase: any,
  code: string,
  cartTotal?: number
): Promise<ChatCoupon> {
  const trimmed = (code || '').trim().toUpperCase();
  if (!trimmed) return { valid: false, code: trimmed, reason: 'No code provided.' };

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', trimmed)
    .single();

  if (error || !data) {
    return { valid: false, code: trimmed, reason: 'This coupon code does not exist.' };
  }

  const now = new Date();
  if (!data.is_active) return { valid: false, code: trimmed, reason: 'This coupon is no longer active.' };
  if (data.start_date && new Date(data.start_date) > now) return { valid: false, code: trimmed, reason: 'This coupon is not yet valid.' };
  if (data.end_date && new Date(data.end_date) < now) return { valid: false, code: trimmed, reason: 'This coupon has expired.' };
  if (data.usage_limit && data.usage_count >= data.usage_limit) return { valid: false, code: trimmed, reason: 'This coupon has reached its usage limit.' };
  if (cartTotal !== undefined && data.minimum_purchase && cartTotal < Number(data.minimum_purchase)) {
    return { valid: false, code: trimmed, reason: `Minimum purchase of GH₵${Number(data.minimum_purchase).toFixed(2)} required.` };
  }

  return {
    valid: true,
    code: trimmed,
    type: data.type,
    value: Number(data.value),
    minimum_purchase: data.minimum_purchase ? Number(data.minimum_purchase) : undefined,
    maximum_discount: data.maximum_discount ? Number(data.maximum_discount) : undefined,
    expires: data.end_date || undefined,
  };
}

// ─── 6. Create Support Ticket ───────────────────────────────────────────────

export async function createSupportTicket(
  supabase: any,
  params: { userId?: string; email: string; subject: string; description: string; category?: string }
): Promise<ChatTicket | null> {
  const { userId, email, subject, description, category } = params;
  if (!email || !subject || !description) return null;

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId || null,
      email,
      subject,
      description,
      category: category || 'other',
      status: 'open',
      priority: 'medium',
    })
    .select('id, ticket_number, status, subject')
    .single();

  if (error || !ticket) {
    console.error('[ChatTools] createSupportTicket error:', error);
    return null;
  }

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    user_id: userId || null,
    message: description,
    is_internal: false,
  });

  return {
    id: ticket.id,
    ticket_number: ticket.ticket_number,
    status: ticket.status,
    subject: ticket.subject,
  };
}

// ─── 7. Initiate Return ─────────────────────────────────────────────────────

export async function initiateReturn(
  supabase: any,
  params: { userId: string; orderId: string; reason: string; description: string }
): Promise<ChatReturn | null> {
  const { userId, orderId, reason, description } = params;
  if (!userId || !orderId) return null;

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at, user_id')
    .eq('id', orderId)
    .single();

  if (!order) return null;
  if (order.user_id !== userId) return null;
  if (order.status !== 'delivered') return null;

  const deliveredDate = new Date(order.created_at);
  const daysSinceDelivery = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > 30) return null;

  const { data: ret, error } = await supabase
    .from('return_requests')
    .insert({
      order_id: orderId,
      user_id: userId,
      reason,
      description,
      status: 'pending',
    })
    .select('id, status')
    .single();

  if (error || !ret) {
    console.error('[ChatTools] initiateReturn error:', error);
    return null;
  }

  return {
    id: ret.id,
    status: ret.status,
    order_number: order.order_number,
    reason,
  };
}

// ─── 8. Get Recommendations ─────────────────────────────────────────────────

export async function getRecommendations(
  supabase: any,
  context?: string
): Promise<ChatProduct[]> {
  let query = supabase
    .from('products')
    .select(`id, name, slug, price, quantity, metadata, product_images(url, position)`)
    .eq('status', 'active')
    .gt('quantity', 0);

  if (context?.trim()) {
    query = query.or(`name.ilike.%${context.trim()}%,description.ilike.%${context.trim()}%`);
  }

  const { data, error } = await query
    .order('rating_avg', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(4);

  if (error || !data) return [];
  return data.map(mapProduct);
}

// ─── 9. Get Store Info (static) ─────────────────────────────────────────────

const STORE_INFO: Record<string, string> = {
  shipping: `We deliver across Ghana. Standard delivery takes 1-3 business days within Accra and 3-7 business days outside Accra. Shipping fees vary by location and are calculated at checkout.`,
  returns: `We accept returns within 30 days of delivery for unused items in original packaging. To start a return, go to your account or ask me to help. Refunds are processed within 5-7 business days after we receive the item.`,
  payment: `We accept Mobile Money (MTN, Vodafone Cash, AirtelTigo Money) via our secure Moolre payment gateway. Cash on delivery is available for orders within Accra.`,
  contact: `You can reach us through:\n- This chat (24/7)\n- Email: support@sarahlawsonimports.com\n- Phone: Available on our Contact page\n- Support ticket: I can create one for you right now`,
  about: `Sarah Lawson Imports is Ghana's trusted source for premium quality mannequins, home essentials, electronics, and fashion items. We source directly from China with verified quality and fast delivery across Ghana.`,
  delivery_times: `Accra: 1-3 business days\nKumasi, Takoradi, Cape Coast: 3-5 business days\nOther regions: 5-7 business days\nExpress delivery available for Accra (same day/next day) at extra cost.`,
  hours: `Our online store is open 24/7. Customer support is available Monday-Saturday, 8 AM - 8 PM GMT.`,
};

export function getStoreInfo(topic: string): string {
  const key = (topic || '').toLowerCase().replace(/[^a-z_]/g, '');
  const match = Object.keys(STORE_INFO).find((k) => key.includes(k));
  if (match) return STORE_INFO[match];
  return Object.values(STORE_INFO).join('\n\n');
}

// ─── 10. Get Customer Profile ───────────────────────────────────────────────

export async function getCustomerProfile(
  supabase: any,
  userId: string
): Promise<ChatCustomerProfile | null> {
  if (!userId) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  const { data: customer } = await supabase
    .from('customers')
    .select('total_orders, total_spent, last_order_at')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  return {
    name: profile.full_name || profile.email?.split('@')[0] || 'Customer',
    email: profile.email || '',
    total_orders: Number(customer?.total_orders) || 0,
    total_spent: Number(customer?.total_spent) || 0,
    last_order_at: customer?.last_order_at || null,
  };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function mapProduct(p: any): ChatProduct {
  const qty = Number(p.quantity) ?? 0;
  const moq = Number(p.metadata?.moq) || 1;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image: p.product_images?.[0]?.url || '',
    quantity: qty,
    maxStock: qty,
    moq,
    inStock: qty >= moq,
  };
}
