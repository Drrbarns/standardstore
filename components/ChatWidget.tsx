'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { CartItem } from '@/context/CartContext';
import MarkdownMessage from '@/components/MarkdownMessage';

// ─── Types ──────────────────────────────────────────────────────────────────

type ChatProduct = {
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

type ChatOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  tracking_number?: string;
  items: { name: string; quantity: number; price: number }[];
};

type ChatTicket = {
  id: string;
  ticket_number: number;
  status: string;
  subject: string;
};

type ChatReturn = {
  id: string;
  status: string;
  order_number: string;
  reason: string;
};

type ChatCoupon = {
  valid: boolean;
  code: string;
  reason?: string;
  type?: string;
  value?: number;
  minimum_purchase?: number;
  maximum_discount?: number;
  expires?: string;
};

type ChatAction = {
  type: 'add_to_cart' | 'view_product' | 'view_order' | 'track_order' | 'apply_coupon';
  product?: ChatProduct;
  orderId?: string;
  orderNumber?: string;
  couponCode?: string;
  label?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  actions?: ChatAction[];
  quickReplies?: string[];
  products?: ChatProduct[];
  orderCard?: ChatOrder;
  ticketCard?: ChatTicket;
  returnCard?: ChatReturn;
  couponCard?: ChatCoupon;
  timestamp?: number;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sl-chat-messages';
const SESSION_KEY = 'sl-chat-session';
const WIDGET_TITLE = 'Sarah Lawson Imports';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    const last30 = msgs.slice(-30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(last30));
  } catch {}
}

// ─── Status Helpers ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Packaged',
  dispatched_to_rider: 'Dispatched To Rider',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  open: 'Open',
  in_progress: 'In Progress',
  waiting_customer: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  dispatched_to_rider: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${color}`}>{label}</span>;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart, setIsCartOpen } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const stored = loadMessages();
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm your AI shopping assistant. I can help you find products, track orders, check discounts, and much more. What can I help you with?",
          quickReplies: ['Find a product', 'Track my order', 'What do you recommend?', 'Store info'],
          timestamp: Date.now(),
        },
      ]);
    }
    setInitialized(true);
  }, []);

  // Persist messages
  useEffect(() => {
    if (initialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, initialized]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [messages, loading, open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Send message
  const send = useCallback(async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    if (!text) setInput('');
    const userMsg: ChatMessage = { role: 'user', content: msgText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: messages.slice(-18).map((m) => ({ role: m.role, content: m.content })),
          newMessage: msgText,
          sessionId: getSessionId(),
          pagePath: pathname,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.message || "Sorry, I couldn't process that.",
        actions: data.actions,
        quickReplies: data.quickReplies,
        products: data.products,
        orderCard: data.orderCard,
        ticketCard: data.ticketCard,
        returnCard: data.returnCard,
        couponCard: data.couponCard,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!open) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please check your internet and try again.', quickReplies: ['Try again'], timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open, pathname]);

  const handleAddToCart = useCallback((product: ChatProduct) => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.moq || 1,
      slug: product.slug,
      maxStock: product.maxStock,
      moq: product.moq,
    };
    addToCart(item);
    setIsCartOpen(true);
  }, [addToCart, setIsCartOpen]);

  const handleQuickReply = useCallback((text: string) => {
    send(text);
  }, [send]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const clearChat = useCallback(() => {
    if (messages.length > 3 && !feedbackSent) {
      setShowFeedback(true);
      return;
    }
    performClearChat();
  }, [messages.length, feedbackSent]);

  const performClearChat = useCallback(() => {
    const initial: ChatMessage[] = [{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      quickReplies: ['Find a product', 'Track my order', 'What do you recommend?', 'Store info'],
      timestamp: Date.now(),
    }];
    setMessages(initial);
    saveMessages(initial);
    sessionStorage.removeItem(SESSION_KEY);
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackText('');
    setFeedbackSent(false);
  }, []);

  const submitFeedback = useCallback(async () => {
    if (feedbackRating === 0) return;
    try {
      await fetch('/api/support/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          feedback_text: feedbackText || null,
          feedback_categories: [],
        }),
      });
    } catch {}
    setFeedbackSent(true);
    setShowFeedback(false);
    performClearChat();
  }, [feedbackRating, feedbackText, performClearChat]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-[9999] w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <i className={`text-2xl transition-transform duration-300 ${open ? 'ri-close-line rotate-90' : 'ri-chat-smile-3-line'}`} aria-hidden />
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed z-[9998] bg-white shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden bottom-0 right-0 w-full h-full sm:bottom-[7rem] sm:right-4 sm:w-[420px] sm:h-[min(70vh,580px)] sm:rounded-2xl"
          role="dialog"
          aria-label="Chat with us"
          style={{ animation: 'chatSlideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <i className="ri-robot-2-line text-lg" aria-hidden />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">{WIDGET_TITLE}</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block animate-pulse" />
                  AI Assistant &middot; Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                title="Clear chat"
              >
                <i className="ri-delete-bin-6-line text-sm" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors sm:hidden"
                title="Close"
              >
                <i className="ri-close-line text-lg" aria-hidden />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                message={m}
                onAddToCart={handleAddToCart}
                onQuickReply={handleQuickReply}
                isLast={i === messages.length - 1}
              />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400 ml-1">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Panel */}
          {showFeedback && (
            <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 flex-shrink-0 space-y-3">
              <p className="text-sm font-semibold text-gray-800">How was your experience?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setFeedbackRating(star)}
                    className={`text-2xl transition-transform hover:scale-110 ${star <= feedbackRating ? 'text-amber-400' : 'text-gray-300'}`}>
                    <i className={star <= feedbackRating ? 'ri-star-fill' : 'ri-star-line'} />
                  </button>
                ))}
              </div>
              {feedbackRating > 0 && (
                <input value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Any feedback? (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              )}
              <div className="flex gap-2">
                <button type="button" onClick={submitFeedback} disabled={feedbackRating === 0}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                  Submit &amp; Clear
                </button>
                <button type="button" onClick={performClearChat}
                  className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                disabled={loading}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
                aria-label="Send"
              >
                <i className="ri-send-plane-fill text-lg" aria-hidden />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-300 mt-1.5">Powered by <a href="https://doctorbarns.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Doctor Barns Tech</a></p>
          </div>
        </div>
      )}

      {/* Global Animation */}
      <style jsx global>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg-animate {
          animation: chatFadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
}

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onAddToCart,
  onQuickReply,
  isLast,
}: {
  message: ChatMessage;
  onAddToCart: (p: ChatProduct) => void;
  onQuickReply: (text: string) => void;
  isLast: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} chat-msg-animate`}>
      <div className={`max-w-[88%] space-y-2`}>
        {/* Text bubble */}
        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? 'bg-emerald-600 text-white rounded-br-sm shadow-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
            }`}
          >
            <MarkdownMessage content={message.content} isUserMessage={isUser} />
          </div>
        )}

        {/* Product Cards */}
        {message.products && message.products.length > 0 && (
          <div className="space-y-2">
            {message.products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}

        {/* Legacy add_to_cart actions (when no products array) */}
        {!message.products && message.actions && message.actions.length > 0 && (
          <div className="space-y-2">
            {message.actions.map((a) =>
              a.type === 'add_to_cart' && a.product ? (
                <ProductCard key={a.product.id} product={a.product} onAddToCart={onAddToCart} />
              ) : null
            )}
          </div>
        )}

        {/* Order Card */}
        {message.orderCard && <OrderCard order={message.orderCard} />}

        {/* Ticket Card */}
        {message.ticketCard && <TicketCard ticket={message.ticketCard} />}

        {/* Return Card */}
        {message.returnCard && <ReturnCard ret={message.returnCard} />}

        {/* Coupon Card */}
        {message.couponCard && <CouponCard coupon={message.couponCard} />}

        {/* Quick Replies */}
        {isLast && !isUser && message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.quickReplies.map((qr) => (
              <button
                key={qr}
                type="button"
                onClick={() => onQuickReply(qr)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95 shadow-sm"
              >
                {qr}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────

function ProductCard({ product, onAddToCart }: { product: ChatProduct; onAddToCart: (p: ChatProduct) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <i className="ri-image-line text-xl" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-sm font-bold text-emerald-600">GH₵{product.price.toFixed(2)}</p>
          <span className={`text-[10px] font-medium ${product.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {product.inStock && (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95"
            >
              <i className="ri-shopping-cart-line mr-1" />
              Add
            </button>
          )}
          <a
            href={`/products/${product.slug}`}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-all text-center"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: ChatOrder }) {
  const statusSteps = ['pending', 'processing', 'shipped', 'dispatched_to_rider', 'delivered'];
  const currentIdx = statusSteps.indexOf(order.status);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Order</p>
          <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Mini Progress */}
      {currentIdx >= 0 && order.status !== 'cancelled' && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-2 h-2 rounded-full ${idx <= currentIdx ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${idx < currentIdx ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">Ordered</span>
            <span className="text-[9px] text-gray-400">Delivered</span>
          </div>
        </div>
      )}

      <div className="px-4 py-2 space-y-1">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-600 truncate flex-1">{item.name} x{item.quantity}</span>
            <span className="text-gray-900 font-medium ml-2">GH₵{item.price.toFixed(2)}</span>
          </div>
        ))}
        {order.items.length > 3 && <p className="text-[10px] text-gray-400">+{order.items.length - 3} more items</p>}
      </div>
      <div className="px-4 py-2 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-GB')}</span>
        <span className="text-sm font-bold text-gray-900">GH₵{order.total.toFixed(2)}</span>
      </div>
      {order.tracking_number && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-gray-400">
            Tracking: <span className="font-mono text-gray-600">{order.tracking_number}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Ticket Card ────────────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: ChatTicket }) {
  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-blue-50/50">
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-customer-service-2-line text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Support Ticket Created</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
          <span className="text-xs font-mono text-blue-600">#{ticket.ticket_number}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Our team will review your ticket and get back to you. You can also check the status in your account.
        </p>
      </div>
    </div>
  );
}

// ─── Return Card ────────────────────────────────────────────────────────────

function ReturnCard({ ret }: { ret: ChatReturn }) {
  return (
    <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-orange-50/50">
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-arrow-go-back-line text-orange-600" />
          <span className="text-xs font-bold text-orange-700">Return Request Submitted</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Order: <span className="font-medium">{ret.order_number}</span></p>
          <p className="text-xs text-gray-600">Reason: <span className="font-medium">{ret.reason}</span></p>
          <StatusBadge status={ret.status} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          We&apos;ll review your return request and notify you of the next steps via email.
        </p>
      </div>
    </div>
  );
}

// ─── Coupon Card ────────────────────────────────────────────────────────────

function CouponCard({ coupon }: { coupon: ChatCoupon }) {
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${coupon.valid ? 'bg-white border-emerald-100' : 'bg-white border-red-100'}`}>
      <div className={`px-4 py-3 ${coupon.valid ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <i className={`${coupon.valid ? 'ri-coupon-3-line text-emerald-600' : 'ri-close-circle-line text-red-500'}`} />
          <span className={`text-xs font-bold ${coupon.valid ? 'text-emerald-700' : 'text-red-600'}`}>
            {coupon.valid ? 'Valid Coupon' : 'Invalid Coupon'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{coupon.code}</span>
          {coupon.valid && coupon.value && (
            <span className="text-sm font-bold text-emerald-600">
              {coupon.type === 'percentage' ? `${coupon.value}% OFF` : coupon.type === 'free_shipping' ? 'Free Shipping' : `GH₵${coupon.value.toFixed(2)} OFF`}
            </span>
          )}
        </div>
        {!coupon.valid && coupon.reason && (
          <p className="text-xs text-red-500 mt-1">{coupon.reason}</p>
        )}
        {coupon.valid && coupon.minimum_purchase && (
          <p className="text-[10px] text-gray-400 mt-1">Min. purchase: GH₵{coupon.minimum_purchase.toFixed(2)}</p>
        )}
        {coupon.valid && coupon.expires && (
          <p className="text-[10px] text-gray-400">Expires: {new Date(coupon.expires).toLocaleDateString('en-GB')}</p>
        )}
      </div>
    </div>
  );
}
