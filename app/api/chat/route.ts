import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  searchProducts,
  getProductForCart,
  trackOrder,
  getCustomerOrders,
  checkCoupon,
  createSupportTicket,
  initiateReturn,
  getRecommendations,
  getStoreInfo,
  getCustomerProfile,
  type ChatProduct,
  type ChatOrder,
  type ChatCoupon,
  type ChatTicket,
  type ChatReturn,
  type ChatCustomerProfile,
} from '@/lib/chat-tools';

// ─── Env ────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

// ─── Types ──────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  quickReplies?: string[];
  orderCard?: ChatOrder;
  ticketCard?: ChatTicket;
  returnCard?: ChatReturn;
  couponCard?: ChatCoupon;
  products?: ChatProduct[];
}

interface ChatAction {
  type: 'add_to_cart' | 'view_product' | 'view_order' | 'track_order' | 'apply_coupon';
  product?: ChatProduct;
  orderId?: string;
  orderNumber?: string;
  couponCode?: string;
  label?: string;
}

interface RequestBody {
  messages?: ChatMessage[];
  newMessage?: string;
  sessionId?: string;
  pagePath?: string;
}

// ─── Rate Limiting (in-memory) ──────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── OpenAI Tool Definitions ────────────────────────────────────────────────

const OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_products',
      description: 'Search for products by name, description, or category. Use when the customer asks about availability, what products exist, to find a product, or wants to browse.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search term from the user' } },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_product_for_cart',
      description: 'Get one specific product by slug or id for adding to cart. Use when the user wants to add a specific known product.',
      parameters: {
        type: 'object',
        properties: { slug_or_id: { type: 'string', description: 'Product slug or UUID' } },
        required: ['slug_or_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'track_order',
      description: 'Track an order by order number and email. Use when the customer wants to know the status of a specific order.',
      parameters: {
        type: 'object',
        properties: {
          order_number: { type: 'string', description: 'Order number (e.g. ORD-xxx) or tracking number' },
          email: { type: 'string', description: 'Email address associated with the order' },
        },
        required: ['order_number', 'email'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_customer_orders',
      description: 'Get recent orders for the logged-in customer. Use when they ask "show me my orders" or "my recent orders" or "reorder". Only works for authenticated users.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Number of orders to return (default 5)' } },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'check_coupon',
      description: 'Validate a coupon or discount code. Use when the customer asks about a promo code, discount, or coupon.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Coupon code to validate' },
          cart_total: { type: 'number', description: 'Optional current cart total for minimum purchase check' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_support_ticket',
      description: 'Create a support ticket to escalate an issue to the human support team. Use when the customer has a problem you cannot solve, wants to report an issue, or requests to speak with a human.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Short summary of the issue' },
          description: { type: 'string', description: 'Detailed description of the problem' },
          category: { type: 'string', enum: ['order_issue', 'product_inquiry', 'payment', 'shipping', 'return', 'other'], description: 'Issue category' },
        },
        required: ['subject', 'description'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'initiate_return',
      description: 'Start a return request for a delivered order. Only for logged-in users with a delivered order within 30 days. Ask for the order ID and reason before calling.',
      parameters: {
        type: 'object',
        properties: {
          order_id: { type: 'string', description: 'UUID of the order to return' },
          reason: { type: 'string', description: 'Reason for the return' },
          description: { type: 'string', description: 'Additional details about the return' },
        },
        required: ['order_id', 'reason'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_recommendations',
      description: 'Get product recommendations. Use when the customer asks "what do you recommend?", "bestsellers", "popular items", or you want to suggest alternatives.',
      parameters: {
        type: 'object',
        properties: { context: { type: 'string', description: 'Optional category or interest for recommendations' } },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_store_info',
      description: 'Get store information and policies. Use for questions about shipping, returns policy, payment methods, delivery times, contact info, or business hours.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', enum: ['shipping', 'returns', 'payment', 'contact', 'about', 'delivery_times', 'hours'], description: 'Topic to get info about' },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_customer_profile',
      description: 'Get the logged-in customer\'s profile information. Use to personalize the conversation or when the customer asks about their account details.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// ─── System Prompt Builder ──────────────────────────────────────────────────

function buildSystemPrompt(profile: ChatCustomerProfile | null, pagePath?: string): string {
  const now = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let prompt = `You are the AI shopping assistant for Sarah Lawson Imports — Ghana's trusted source for premium mannequins, home essentials, electronics, and fashion items. Today is ${now}.

CORE BEHAVIORS:
- Be warm, helpful, and concise. Use a friendly but professional tone.
- Always quote prices in GH₵ (Ghana Cedis).
- When mentioning products, include the exact name and price.
- If a product is out of stock, say so and proactively suggest alternatives using get_recommendations.
- For order tracking, always ask for both order number AND email if not provided.
- If you can't help with something, offer to create a support ticket.
- Never make up information — if unsure, use the appropriate tool to look it up.
- Keep responses concise (2-4 sentences max for simple questions).

STORE POLICIES (quick reference):
- Delivery: 1-3 days Accra, 3-7 days rest of Ghana
- Returns: Within 30 days of delivery, unused items in original packaging
- Payment: Mobile Money (MTN, Vodafone, AirtelTigo), Cash on Delivery (Accra only)
- Support hours: Mon-Sat, 8 AM - 8 PM GMT

CAPABILITIES:
- Search and recommend products
- Check product availability and pricing
- Track orders by order number + email
- Show recent orders (logged-in users)
- Validate coupon/discount codes
- Create support tickets
- Initiate returns (logged-in users, delivered orders within 30 days)
- Answer questions about shipping, returns, payment, and store info`;

  if (profile) {
    prompt += `\n\nCUSTOMER CONTEXT (logged in):
- Name: ${profile.name}
- Email: ${profile.email}
- Total orders: ${profile.total_orders}
- Total spent: GH₵${profile.total_spent.toFixed(2)}
- Last order: ${profile.last_order_at ? new Date(profile.last_order_at).toLocaleDateString('en-GB') : 'N/A'}
Address the customer by their first name. You can access their orders and profile directly.`;
  } else {
    prompt += `\n\nCUSTOMER CONTEXT: Guest (not logged in). For order tracking, you'll need their order number and email. Suggest signing in for a more personalized experience when relevant.`;
  }

  if (pagePath) {
    prompt += `\n\nThe customer is currently viewing: ${pagePath}`;
    if (pagePath.includes('/products/')) {
      prompt += ` — They may be interested in this specific product.`;
    } else if (pagePath.includes('/order-tracking')) {
      prompt += ` — They likely need help tracking an order.`;
    } else if (pagePath.includes('/cart') || pagePath.includes('/checkout')) {
      prompt += ` — They are in the purchasing flow; help them complete their purchase.`;
    }
  }

  return prompt;
}

// ─── Auth Detection ─────────────────────────────────────────────────────────

async function detectAuth(request: Request): Promise<{ userId: string | null; email: string | null }> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const authToken = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('sb-') && c.includes('-auth-token'))
      ?.split('=')
      .slice(1)
      .join('=');

    if (!authToken) return { userId: null, email: null };

    const decoded = decodeURIComponent(authToken);
    let tokenData: any;
    try {
      tokenData = JSON.parse(decoded);
    } catch {
      tokenData = decoded;
    }

    const accessToken = typeof tokenData === 'string' ? tokenData : tokenData?.[0] || tokenData?.access_token;
    if (!accessToken) return { userId: null, email: null };

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return { userId: user.id, email: user.email || null };
    }
  } catch (e) {
    console.error('[Chat API] Auth detection error:', e);
  }
  return { userId: null, email: null };
}

// ─── Main POST Handler ──────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { messages = [], newMessage, sessionId, pagePath } = body;

    const userText = (newMessage || '').trim();
    if (!userText) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const rateLimitKey = sessionId || request.headers.get('x-forwarded-for') || 'default';
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { message: "You're sending messages too quickly. Please wait a moment and try again.", quickReplies: [] },
        { status: 429 }
      );
    }

    const { userId, email: userEmail } = await detectAuth(request);

    const supabase = supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseKey);

    let profile: ChatCustomerProfile | null = null;
    if (userId) {
      profile = await getCustomerProfile(supabase, userId);
    }

    let result: any;
    if (openaiKey) {
      result = await handleWithOpenAI(supabase, messages, userText, openaiKey, userId, userEmail, profile, pagePath);
    } else {
      result = await handleWithoutAI(supabase, userText, profile);
    }

    if (sessionId) {
      persistConversation(supabase, sessionId, userId, messages, userText, result).catch((e) =>
        console.error('[Chat API] Persistence error:', e)
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Chat API] Error:', err);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.', quickReplies: ['Try again'] },
      { status: 500 }
    );
  }
}

// ─── Conversation Persistence ───────────────────────────────────────────────

async function persistConversation(
  supabase: any,
  sessionId: string,
  userId: string | null,
  previousMessages: ChatMessage[],
  userText: string,
  result: any
) {
  const allMessages = [
    ...previousMessages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
    { role: 'assistant', content: result.message || '' },
  ];

  const last20 = allMessages.slice(-20);

  await supabase.rpc('upsert_chat_conversation', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_messages: JSON.stringify(last20),
    p_metadata: JSON.stringify({ lastActivity: new Date().toISOString() }),
  });
}

// ─── Rule-Based Fallback ────────────────────────────────────────────────────

async function handleWithoutAI(supabase: any, userText: string, profile: ChatCustomerProfile | null) {
  const lower = userText.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(userText)) {
    const greeting = profile ? `Hi ${profile.name.split(' ')[0]}! ` : 'Hi there! ';
    return {
      message: `${greeting}I'm your shopping assistant. I can help you find products, track orders, check stock, and more. What can I help you with?`,
      quickReplies: ['Find a product', 'Track my order', 'What do you recommend?', 'Store info'],
    };
  }

  if (/\b(track|where.*(my|is).*(order|package)|order status)\b/i.test(lower)) {
    return {
      message: 'I can help you track your order! Please provide your order number (e.g. ORD-xxx) and the email address you used when ordering.',
      quickReplies: ['I have my order number', 'I forgot my order number'],
    };
  }

  if (/\b(shipping|delivery|how long|deliver)\b/i.test(lower)) {
    return {
      message: getStoreInfo('shipping'),
      quickReplies: ['Delivery times', 'Payment methods', 'Returns policy'],
    };
  }

  if (/\b(return|refund|exchange)\b/i.test(lower)) {
    return {
      message: getStoreInfo('returns'),
      quickReplies: ['Start a return', 'Track my order', 'Contact support'],
    };
  }

  if (/\b(pay|payment|mobile money|momo|cash on delivery)\b/i.test(lower)) {
    return {
      message: getStoreInfo('payment'),
      quickReplies: ['Shipping info', 'Find a product'],
    };
  }

  if (/\b(contact|support|human|agent|speak|talk|help me)\b/i.test(lower)) {
    return {
      message: getStoreInfo('contact'),
      quickReplies: ['Create a support ticket', 'Track my order', 'Find a product'],
    };
  }

  if (/\b(recommend|popular|bestseller|suggest|trending)\b/i.test(lower)) {
    const products = await getRecommendations(supabase);
    if (products.length > 0) {
      const actions: ChatAction[] = products.filter((p) => p.inStock).map((p) => ({ type: 'add_to_cart' as const, product: p }));
      return {
        message: 'Here are some of our top picks:',
        products,
        actions,
        quickReplies: ['Show me more', 'Search for something specific'],
      };
    }
  }

  if (/\b(coupon|promo|discount|code)\b/i.test(lower)) {
    return {
      message: 'I can check a coupon code for you! Just tell me the code and I\'ll verify if it\'s valid.',
      quickReplies: ['I have a code', 'Find a product', 'What deals are available?'],
    };
  }

  if (/\b(thanks|thank you|bye|goodbye)\b/i.test(lower)) {
    return {
      message: 'You\'re welcome! If you need anything else, I\'m always here to help. Happy shopping!',
      quickReplies: ['Find a product', 'Track my order'],
    };
  }

  const isSearch = /\b(available|stock|have|find|search|look|buy|price|how much|get|show|want)\b/i.test(userText) ||
    (userText.length > 2 && !userText.endsWith('?'));

  if (isSearch || lower.includes('product') || lower.includes('item')) {
    const query = userText
      .replace(/\b(do you have|is there|are there|show me|find|search|available|in stock|price|how much|get|buy|i want|i need)\b/gi, '')
      .replace(/\?/g, '')
      .trim() || ' ';

    const products = await searchProducts(supabase, query, 4);
    if (products.length > 0) {
      const actions: ChatAction[] = products.filter((p) => p.inStock).map((p) => ({ type: 'add_to_cart' as const, product: p }));
      return {
        message: `Here's what I found:`,
        products,
        actions,
        quickReplies: ['Show me more', 'Add to cart', 'Something else'],
      };
    }
  }

  const fallback = await searchProducts(supabase, userText.slice(0, 50), 3);
  if (fallback.length > 0) {
    const actions: ChatAction[] = fallback.filter((p) => p.inStock).map((p) => ({ type: 'add_to_cart' as const, product: p }));
    return {
      message: 'I found these products that might interest you:',
      products: fallback,
      actions,
      quickReplies: ['Search for something else', 'Track my order', 'Store info'],
    };
  }

  return {
    message: "I'm not quite sure what you're looking for. I can help with:\n- Finding and buying products\n- Tracking orders\n- Checking coupons\n- Store policies and info\n- Creating support tickets\n\nWhat would you like help with?",
    quickReplies: ['Find a product', 'Track my order', 'What do you recommend?', 'Contact support'],
  };
}

// ─── OpenAI Handler with Function Calling ───────────────────────────────────

async function handleWithOpenAI(
  supabase: any,
  messages: ChatMessage[],
  userText: string,
  apiKey: string,
  userId: string | null,
  userEmail: string | null,
  profile: ChatCustomerProfile | null,
  pagePath?: string
) {
  const systemPrompt = buildSystemPrompt(profile, pagePath);

  const truncatedHistory = messages.slice(-18);

  const openaiMessages: { role: MessageRole; content: string; tool_call_id?: string; name?: string }[] = [
    { role: 'system', content: systemPrompt },
    ...truncatedHistory.map((m) => ({ role: m.role as MessageRole, content: m.content })),
    { role: 'user', content: userText },
  ];

  let allProducts: ChatProduct[] = [];
  let allActions: ChatAction[] = [];
  let orderCard: ChatOrder | undefined;
  let ticketCard: ChatTicket | undefined;
  let returnCard: ChatReturn | undefined;
  let couponCard: ChatCoupon | undefined;
  let quickReplies: string[] = [];

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        tools: OPENAI_TOOLS,
        tool_choice: 'auto',
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error('[Chat API] OpenAI error:', await res.text());
      return await handleWithoutAI(supabase, userText, profile);
    }

    let data = await res.json();
    let choice = data.choices?.[0];
    let toolCalls = choice?.message?.tool_calls;

    // Handle tool calls (support up to 2 rounds of tool calling)
    let rounds = 0;
    while (Array.isArray(toolCalls) && toolCalls.length > 0 && rounds < 2) {
      rounds++;

      openaiMessages.push(choice.message);

      for (const tc of toolCalls) {
        const fnName = tc.function?.name;
        let args: any = {};
        try { args = JSON.parse(tc.function?.arguments || '{}'); } catch {}

        const toolResult = await executeToolCall(supabase, fnName, args, userId, userEmail, profile);

        if (toolResult.products) allProducts.push(...toolResult.products);
        if (toolResult.orderCard) orderCard = toolResult.orderCard;
        if (toolResult.ticketCard) ticketCard = toolResult.ticketCard;
        if (toolResult.returnCard) returnCard = toolResult.returnCard;
        if (toolResult.couponCard) couponCard = toolResult.couponCard;
        if (toolResult.quickReplies) quickReplies = toolResult.quickReplies;

        openaiMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult.data),
          tool_call_id: tc.id,
        });
      }

      const followUpRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openaiMessages,
          tools: OPENAI_TOOLS,
          tool_choice: 'auto',
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!followUpRes.ok) break;
      data = await followUpRes.json();
      choice = data.choices?.[0];
      toolCalls = choice?.message?.tool_calls;
    }

    const assistantContent = choice?.message?.content?.trim() ||
      "I'm here to help! Could you tell me more about what you're looking for?";

    allActions = allProducts.filter((p) => p.inStock).map((p) => ({ type: 'add_to_cart' as const, product: p }));

    if (!quickReplies.length) {
      quickReplies = generateQuickReplies(userText, allProducts, orderCard, ticketCard);
    }

    return {
      message: assistantContent,
      products: allProducts.length > 0 ? allProducts : undefined,
      actions: allActions.length > 0 ? allActions : undefined,
      orderCard,
      ticketCard,
      returnCard,
      couponCard,
      quickReplies,
    };
  } catch (err: any) {
    console.error('[Chat API] OpenAI handler error:', err);
    return await handleWithoutAI(supabase, userText, profile);
  }
}

// ─── Tool Call Executor ─────────────────────────────────────────────────────

async function executeToolCall(
  supabase: any,
  fnName: string,
  args: any,
  userId: string | null,
  userEmail: string | null,
  profile: ChatCustomerProfile | null
): Promise<{
  data: any;
  products?: ChatProduct[];
  orderCard?: ChatOrder;
  ticketCard?: ChatTicket;
  returnCard?: ChatReturn;
  couponCard?: ChatCoupon;
  quickReplies?: string[];
}> {
  switch (fnName) {
    case 'search_products': {
      const products = await searchProducts(supabase, args.query, 4);
      return {
        data: products.map((p) => ({ name: p.name, price: p.price, inStock: p.inStock, slug: p.slug })),
        products,
        quickReplies: products.length > 0 ? ['Show me more', 'Add to cart'] : ['Try different search', 'What do you recommend?'],
      };
    }

    case 'get_product_for_cart': {
      const product = await getProductForCart(supabase, args.slug_or_id);
      return {
        data: product ? { name: product.name, price: product.price, inStock: product.inStock } : { error: 'Product not found' },
        products: product ? [product] : undefined,
      };
    }

    case 'track_order': {
      const order = await trackOrder(supabase, args.order_number, args.email);
      if (!order) {
        return { data: { error: 'Order not found. Please check the order number and email address.' }, quickReplies: ['Try again', 'Contact support'] };
      }
      return {
        data: {
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          tracking_number: order.tracking_number,
          items: order.items.slice(0, 5),
          created_at: order.created_at,
        },
        orderCard: order,
        quickReplies: ['I have an issue with this order', 'Track another order'],
      };
    }

    case 'get_customer_orders': {
      if (!userId) {
        return { data: { error: 'You need to be logged in to view your orders. Please sign in first.' }, quickReplies: ['Sign in', 'Track order by number'] };
      }
      const orders = await getCustomerOrders(supabase, userId, args.limit || 5);
      return {
        data: orders.map((o) => ({ order_number: o.order_number, status: o.status, total: o.total, date: o.created_at, items_count: o.items.length })),
        orderCard: orders[0],
        quickReplies: orders.length > 0 ? ['Track an order', 'Reorder'] : ['Browse products'],
      };
    }

    case 'check_coupon': {
      const coupon = await checkCoupon(supabase, args.code, args.cart_total);
      return {
        data: coupon,
        couponCard: coupon,
        quickReplies: coupon.valid ? ['Apply at checkout', 'Continue shopping'] : ['Try another code', 'Find a product'],
      };
    }

    case 'create_support_ticket': {
      const email = userEmail || profile?.email || '';
      if (!email) {
        return { data: { error: 'I need your email address to create a support ticket. Could you provide it?' }, quickReplies: ['Provide email'] };
      }
      const ticket = await createSupportTicket(supabase, {
        userId: userId || undefined,
        email,
        subject: args.subject,
        description: args.description,
        category: args.category,
      });
      if (!ticket) {
        return { data: { error: 'Failed to create ticket. Please try again.' }, quickReplies: ['Try again', 'Contact us directly'] };
      }
      return {
        data: { ticket_number: ticket.ticket_number, subject: ticket.subject, status: ticket.status },
        ticketCard: ticket,
        quickReplies: ['Continue shopping', 'Track my order'],
      };
    }

    case 'initiate_return': {
      if (!userId) {
        return { data: { error: 'You need to be logged in to initiate a return. Please sign in first.' }, quickReplies: ['Sign in', 'Contact support'] };
      }
      const ret = await initiateReturn(supabase, {
        userId,
        orderId: args.order_id,
        reason: args.reason,
        description: args.description || args.reason,
      });
      if (!ret) {
        return { data: { error: 'Could not create return request. The order may not be eligible (must be delivered within 30 days).' }, quickReplies: ['Check eligibility', 'Contact support'] };
      }
      return {
        data: { id: ret.id, status: ret.status, order_number: ret.order_number },
        returnCard: ret,
        quickReplies: ['Continue shopping', 'View my orders'],
      };
    }

    case 'get_recommendations': {
      const products = await getRecommendations(supabase, args.context);
      return {
        data: products.map((p) => ({ name: p.name, price: p.price, inStock: p.inStock, slug: p.slug })),
        products,
        quickReplies: ['Show me more', 'Search for something specific'],
      };
    }

    case 'get_store_info': {
      const info = getStoreInfo(args.topic);
      return {
        data: { topic: args.topic, info },
        quickReplies: ['Shipping', 'Returns', 'Payment', 'Contact'].filter((r) => r.toLowerCase() !== args.topic?.toLowerCase()),
      };
    }

    case 'get_customer_profile': {
      if (!userId || !profile) {
        return { data: { error: 'Not logged in' } };
      }
      return { data: { name: profile.name, email: profile.email, total_orders: profile.total_orders } };
    }

    default:
      return { data: { error: `Unknown tool: ${fnName}` } };
  }
}

// ─── Quick Reply Generator ──────────────────────────────────────────────────

function generateQuickReplies(
  userText: string,
  products: ChatProduct[],
  orderCard?: ChatOrder,
  ticketCard?: ChatTicket
): string[] {
  if (ticketCard) return ['Continue shopping', 'Track my order'];
  if (orderCard) return ['I have an issue', 'Track another order', 'Continue shopping'];
  if (products.length > 0) return ['Add to cart', 'Show me more', 'Something else'];

  const lower = userText.toLowerCase();
  if (/\b(hi|hello|hey)\b/.test(lower)) return ['Find a product', 'Track my order', 'What do you recommend?'];
  if (/\b(thank|bye)\b/.test(lower)) return ['Find a product', 'Track my order'];

  return ['Find a product', 'Track my order', 'Store info', 'What do you recommend?'];
}
