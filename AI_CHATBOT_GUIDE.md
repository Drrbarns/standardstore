# AI Shopping Assistant — Complete Implementation Guide

> How the AI chatbot in Sarah Lawson Imports works, and how to replicate it in any Next.js e-commerce project.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Structure](#2-file-structure)
3. [Environment Variables](#3-environment-variables)
4. [Database Schema (Supabase)](#4-database-schema-supabase)
5. [API Route — Core Chat Handler](#5-api-route--core-chat-handler)
6. [Tool Definitions (Function Calling)](#6-tool-definitions-function-calling)
7. [Tool Implementations (chat-tools.ts)](#7-tool-implementations-chat-toolsts)
8. [Site Knowledge Base](#8-site-knowledge-base)
9. [Frontend — ChatWidget Component](#9-frontend--chatwidget-component)
10. [Markdown Message Renderer](#10-markdown-message-renderer)
11. [Voice Chat (STT + TTS)](#11-voice-chat-stt--tts)
12. [Conversation Persistence & Analytics](#12-conversation-persistence--analytics)
13. [AI Memory System](#13-ai-memory-system)
14. [Step-by-Step Setup for a New Project](#14-step-by-step-setup-for-a-new-project)

---

## 1. Architecture Overview

The chatbot is **server-driven** with no special AI SDK dependencies — just `fetch` to an LLM API.

```
┌──────────────────────────────────────────────────────────┐
│  BROWSER (ChatWidget.tsx)                                │
│  - Floating chat button + panel                          │
│  - Text input + voice recording                          │
│  - Product/Order/Ticket/Coupon cards                     │
│  - Quick reply chips                                     │
│  - localStorage for message history                      │
│  - sessionStorage for session ID                         │
│  - Sends cart context from CartContext                    │
└──────────────┬───────────────────────────────────────────┘
               │ POST /api/chat  (JSON)
               ▼
┌──────────────────────────────────────────────────────────┐
│  API ROUTE (app/api/chat/route.ts)                       │
│  1. Rate limiting (in-memory)                            │
│  2. Auth detection (Supabase cookies)                    │
│  3. Fetch customer profile + AI memories                 │
│  4. Build system prompt (brand, policies, cart, context)  │
│  5. Call LLM (Groq) with tool definitions                │
│  6. Execute tool calls → Supabase queries                │
│  7. Multi-round tool calling (up to 3 rounds)            │
│  8. Strip leaked reasoning from response                 │
│  9. Persist conversation to Supabase                     │
│  10. Return: message, products, actions, cards            │
└──────────────┬───────────────────────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│  Groq API   │  │   Supabase   │
│  (LLM)      │  │  (Database)  │
│  - Chat     │  │  - products  │
│  - Whisper  │  │  - orders    │
│  - TTS      │  │  - coupons   │
└─────────────┘  │  - tickets   │
                 │  - chat_conv │
                 │  - ai_memory │
                 └──────────────┘
```

**Key design decisions:**
- **No AI SDK packages** — uses raw `fetch` to Groq's OpenAI-compatible API
- **Function/tool calling** for structured data retrieval (products, orders, coupons, etc.)
- **Fallback handler** when no API key is set (rule-based regex matching)
- **Cart context** is sent with every message so the AI knows what the customer has
- **Session persistence** in Supabase with sentiment analysis and categorization

---

## 2. File Structure

```
your-project/
├── app/
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts              # Core chat handler (LLM + tools + persistence)
│   │       ├── transcribe/
│   │       │   └── route.ts          # Speech-to-text (Whisper)
│   │       └── speak/
│   │           └── route.ts          # Text-to-speech (TTS)
│   └── (store)/
│       └── layout.tsx                # Mounts ChatWidget
├── components/
│   ├── ChatWidget.tsx                # Main chat UI (floating widget)
│   └── MarkdownMessage.tsx           # Lightweight markdown renderer
├── lib/
│   ├── chat-tools.ts                 # All tool implementations (DB queries, order creation)
│   └── site-knowledge.ts             # Static knowledge base for website Q&A
```

---

## 3. Environment Variables

Add these to your `.env.local`:

```env
# Required for AI chat
GROQ_API_KEY=gsk_your_groq_api_key_here

# Supabase (you likely already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Optional but recommended for server-side tools

# App URL (for payment callbacks)
NEXT_PUBLIC_APP_URL=https://yourstore.com

# Payment gateway (if using Moolre for chat-based orders)
MOOLRE_API_USER=your_api_user
MOOLRE_API_PUBKEY=your_api_pubkey
MOOLRE_ACCOUNT_NUMBER=your_account_number
MOOLRE_MERCHANT_EMAIL=your@email.com
```

**Note:** If `GROQ_API_KEY` is missing, the chatbot falls back to a rule-based handler (regex pattern matching + direct database queries). The chat still works, just without LLM intelligence.

**Getting a Groq API key:** Sign up at [console.groq.com](https://console.groq.com), create an API key. Free tier available.

---

## 4. Database Schema (Supabase)

Create these tables in your Supabase project:

### chat_conversations

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  sentiment TEXT,           -- 'positive', 'negative', 'neutral'
  category TEXT,            -- 'order', 'product', 'return', 'payment', etc.
  intent TEXT,              -- 'product_search', 'order_tracking', etc.
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  customer_email TEXT,
  customer_name TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  page_context TEXT,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
```

### ai_memory

```sql
CREATE TABLE ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id),
  customer_email TEXT,
  memory_type TEXT NOT NULL,       -- 'preference', 'issue', 'note'
  content TEXT NOT NULL,
  importance TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  source_conversation_id UUID REFERENCES chat_conversations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

### RPC: upsert_chat_conversation

```sql
CREATE OR REPLACE FUNCTION upsert_chat_conversation(
  p_session_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_messages JSONB DEFAULT '[]',
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_conversations (session_id, user_id, messages, metadata)
  VALUES (p_session_id, p_user_id, p_messages, p_metadata)
  ON CONFLICT (session_id)
  DO UPDATE SET
    messages = EXCLUDED.messages,
    metadata = EXCLUDED.metadata,
    user_id = COALESCE(EXCLUDED.user_id, chat_conversations.user_id),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### RPC: get_ai_memories

```sql
CREATE OR REPLACE FUNCTION get_ai_memories(
  p_customer_id UUID DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL
) RETURNS TABLE(type TEXT, content TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT m.memory_type, m.content
  FROM ai_memory m
  WHERE (m.customer_id = p_customer_id OR m.customer_email = p_customer_email)
    AND (m.expires_at IS NULL OR m.expires_at > NOW())
  ORDER BY m.importance DESC, m.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
```

### Other tables used by tools

These tables should already exist in your e-commerce schema:
- `products` (id, name, slug, price, quantity, status, description, is_porials, metadata, etc.)
- `product_images` (id, product_id, url, position)
- `orders` (id, order_number, user_id, email, status, payment_status, total, shipping_address, metadata, etc.)
- `order_items` (id, order_id, product_id, product_name, quantity, unit_price, total_price)
- `coupons` (id, code, type, value, is_active, start_date, end_date, usage_limit, usage_count, minimum_purchase)
- `support_tickets` (id, ticket_number, user_id, email, subject, description, category, status, priority)
- `support_messages` (id, ticket_id, user_id, message, is_internal)
- `return_requests` (id, order_id, user_id, reason, description, status)
- `profiles` (id, full_name, email)
- `customers` (id, user_id, email, total_orders, total_spent, last_order_at)
- `support_knowledge_base` (id, title, content, is_published)

---

## 5. API Route — Core Chat Handler

**File:** `app/api/chat/route.ts`

This is the brain of the chatbot. Here's the flow:

### Request Format

```typescript
interface RequestBody {
  messages?: ChatMessage[];       // Previous conversation (last 18)
  newMessage?: string;            // The new user message
  sessionId?: string;             // Browser session ID for persistence
  pagePath?: string;              // Current page the user is viewing
  cartItems?: {                   // Current cart contents
    id: string;
    name: string;
    price: number;
    quantity: number;
    slug: string;
  }[];
}
```

### Response Format

```typescript
{
  message: string;                // AI's text response
  products?: ChatProduct[];       // Product cards to display
  actions?: ChatAction[];         // Add-to-cart buttons, payment links
  orderCard?: ChatOrder;          // Order tracking card
  ticketCard?: ChatTicket;        // Support ticket card
  returnCard?: ChatReturn;        // Return request card
  couponCard?: ChatCoupon;        // Coupon validation card
  quickReplies?: string[];        // Quick reply chip suggestions
}
```

### Key Components

**1. Rate Limiting (in-memory)**
```typescript
const RATE_LIMIT = 12;          // 12 messages
const RATE_WINDOW_MS = 60_000;  // per 60 seconds
```

**2. LLM Configuration**
```typescript
const LLM_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LLM_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
```
You can swap this for any OpenAI-compatible API (OpenAI, Together, Fireworks, local Ollama, etc.) by changing the URL and model name.

**3. Auth Detection**
Reads Supabase auth cookies from the request to identify logged-in users. This enables personalized responses, order history access, and return initiation.

**4. System Prompt Builder**
Constructs a detailed system prompt with:
- Brand identity and personality
- Store policies (shipping, returns, payment)
- Customer profile (if logged in)
- AI memories from past conversations
- Knowledge base articles matching the query
- Current cart contents
- Current page context
- Conversation rules (don't repeat questions, use context, etc.)

**5. Multi-round Tool Calling**
The LLM can call tools up to 3 rounds. For example:
- Round 1: `search_products("kettle")` → returns products
- Round 2: `get_store_info("shipping")` → returns shipping info
- Round 3: Final response combining both

**6. Response Cleaning**
Strips leaked reasoning blocks (`<think>`, `## Step`, etc.) from the model output.

---

## 6. Tool Definitions (Function Calling)

These are OpenAI-compatible function/tool definitions sent to the LLM:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `search_products` | Search products by name/description | `query: string` |
| `get_product_for_cart` | Get one product by slug/ID | `slug_or_id: string` |
| `track_order` | Track order by number + email | `order_number: string, email: string` |
| `get_customer_orders` | Get logged-in user's orders | `limit?: number` |
| `check_coupon` | Validate a coupon code | `code: string, cart_total?: number` |
| `create_support_ticket` | Create a support ticket | `subject, description, category?, email?` |
| `initiate_return` | Start a return request | `order_id, reason, description?` |
| `get_recommendations` | Get recommended products | `context?: string` |
| `get_store_info` | Get store policies/info | `topic: string` |
| `get_customer_profile` | Get logged-in user's profile | (none) |
| `get_website_info` | Search site knowledge base | `query: string` |
| `create_order` | Create order + payment link | `items, shipping, delivery_method, payment_method` |

Each tool is defined as an OpenAI function-calling schema:

```typescript
{
  type: 'function',
  function: {
    name: 'search_products',
    description: 'Search for products by name, description, or category...',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term from the user' }
      },
      required: ['query'],
    },
  },
}
```

---

## 7. Tool Implementations (chat-tools.ts)

**File:** `lib/chat-tools.ts`

Each tool function queries Supabase and returns structured data. Key examples:

### searchProducts
```typescript
export async function searchProducts(supabase, query, limit = 4): Promise<ChatProduct[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, quantity, metadata, product_images(url, position)')
    .eq('status', 'active')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(limit);
  return (data || []).map(mapProduct);
}
```

### trackOrder
Uses a Supabase RPC (stored procedure) to securely look up orders by number + email.

### createChatOrder
The most complex tool — handles:
1. Input validation (email, phone, UUIDs, quantities)
2. Rate limiting (3 orders per 5 minutes per email)
3. Input sanitization (XSS prevention)
4. Stock validation
5. Order + order_items insertion
6. Customer record upsert
7. Payment link generation (Moolre API)

### ChatProduct type
```typescript
type ChatProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  moq: number;        // minimum order quantity
  inStock: boolean;
};
```

---

## 8. Site Knowledge Base

**File:** `lib/site-knowledge.ts`

A static array of knowledge entries that the AI searches when customers ask about the business:

```typescript
export interface SiteKnowledgeEntry {
  id: string;
  title: string;
  path: string;         // e.g. '/about', '/contact'
  category: string;     // 'company', 'contact', 'shipping', etc.
  content: string;      // Full content about this topic
  keywords: string[];   // Search keywords
}

export const SITE_KNOWLEDGE: SiteKnowledgeEntry[] = [
  {
    id: 'business-overview',
    title: 'About Your Store',
    path: '/about',
    category: 'company',
    content: 'Your store description, mission, values...',
    keywords: ['about', 'story', 'mission', 'who', 'founder'],
  },
  // ... more entries for contact, shipping, returns, payment, FAQ, etc.
];
```

The `searchSiteKnowledge` function does keyword matching to find relevant entries. The `getSiteMapSummary` function generates a condensed site overview for the system prompt.

**To adapt for your store:** Replace all entries with your own business information, policies, contact details, FAQ answers, etc.

---

## 9. Frontend — ChatWidget Component

**File:** `components/ChatWidget.tsx`

A self-contained floating chat widget with:

### UI Elements
- **Floating button** (bottom-right, above mobile nav)
- **Chat panel** (slides up with animation)
- **Header** with store name, online status, clear/close buttons
- **Message list** with auto-scroll
- **Input area** with text input + voice record button
- **Feedback panel** (star rating before clearing chat)

### Message Types Rendered
- **Text bubbles** (user = green, assistant = white)
- **Product cards** (image, name, price, Add to Cart, View)
- **Order cards** (order number, status progress bar, items, total)
- **Ticket cards** (ticket number, subject)
- **Return cards** (order number, reason, status)
- **Coupon cards** (valid/invalid, discount value)
- **Payment link buttons** (opens Moolre payment page)
- **Quick reply chips** (tappable suggestions)

### State Management
- `useState` for messages, loading, input, unread count, voice state, feedback
- **No React Context** — all state is local to the widget
- Cart integration via existing `useCart()` context
- Messages persisted to `localStorage` (last 30 messages)
- Session ID in `sessionStorage`

### How to Mount
In your store layout:

```tsx
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });

export default function StoreLayout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

---

## 10. Markdown Message Renderer

**File:** `components/MarkdownMessage.tsx`

A lightweight markdown renderer (no external dependencies) that supports:
- `**bold**` text
- `*italic*` text
- `` `code` `` inline code
- `[links](url)`
- `- bullet lists`
- `1. numbered lists`
- Line breaks

This is used instead of a full markdown library to keep the bundle small.

---

## 11. Voice Chat (STT + TTS)

### Speech-to-Text (Transcription)

**File:** `app/api/chat/transcribe/route.ts`

```
Browser → records audio (WebM/MP4) → POST /api/chat/transcribe (FormData)
  → forwards to Groq Whisper API (whisper-large-v3)
  → returns { text, language, duration }
```

### Text-to-Speech

**File:** `app/api/chat/speak/route.ts`

```
After AI response → POST /api/chat/speak { text }
  → cleans markdown from text
  → forwards to Groq TTS API (orpheus-v1-english, voice: "autumn")
  → returns WAV audio buffer
  → browser auto-plays the response
```

### Voice Flow in ChatWidget
1. User taps mic button → `startRecording()` → `MediaRecorder` API
2. Recording indicator shows with timer (max 60 seconds)
3. User taps stop → audio blob sent to `/api/chat/transcribe`
4. Transcribed text replaces "Transcribing voice..." placeholder
5. Text is sent to `/api/chat` as a normal message
6. AI response text is sent to `/api/chat/speak`
7. WAV audio auto-plays and "Play voice" button appears on the message

---

## 12. Conversation Persistence & Analytics

After every message exchange, the server persists the conversation to Supabase with rich metadata:

### Sentiment Analysis (simple keyword-based)
```typescript
const negativeWords = ['angry', 'frustrated', 'terrible', ...];
const positiveWords = ['great', 'love', 'amazing', ...];
// Counts matches to determine: 'positive', 'negative', or 'neutral'
```

### Category Detection
```typescript
if (/order|track|delivery/i.test(text)) category = 'order';
else if (/product|buy|price/i.test(text)) category = 'product';
// ... etc
```

### Intent Detection
Based on what the AI returned (products → 'product_search', order card → 'order_tracking', etc.)

### What Gets Stored
- Last 20 messages (JSONB)
- Session ID, user ID, email, name
- Sentiment, category, intent, summary
- Message count, duration
- Resolution and escalation flags
- Page context (what page the user was on)

---

## 13. AI Memory System

The chatbot remembers things about customers across sessions:

### Automatic Memory Creation
- **Negative sentiment** → saves an "issue" memory (high importance)
- **Product searches** → saves a "preference" memory (normal importance)

### Memory Usage
On each request, the server fetches up to 10 memories for the customer and injects them into the system prompt:

```
CUSTOMER MEMORY (things you remember about this customer):
- [preference] Interested in: Electric Kettle, Blender
- [issue] Had a negative experience: "my order hasn't arrived"
```

This allows the AI to reference past interactions naturally.

---

## 14. Step-by-Step Setup for a New Project

### Step 1: Get a Groq API Key
- Sign up at [console.groq.com](https://console.groq.com)
- Create an API key
- Add `GROQ_API_KEY=gsk_...` to your `.env.local`

### Step 2: Create Database Tables
Run the SQL from [Section 4](#4-database-schema-supabase) in your Supabase SQL editor.

### Step 3: Create the Chat API Route
Copy `app/api/chat/route.ts` to your project. Customize:
- **System prompt** in `buildSystemPrompt()` — change brand name, policies, contact info
- **LLM model** — change `LLM_MODEL` if you want a different model
- **LLM API URL** — change `LLM_API_URL` if using a different provider (OpenAI, Together, etc.)
- **Tool definitions** in `LLM_TOOLS` — add/remove tools based on your features

### Step 4: Create Tool Implementations
Copy `lib/chat-tools.ts`. Customize:
- **Database queries** to match your schema (table names, column names)
- **Store info** in the `STORE_INFO` object
- **Order creation** logic in `createChatOrder()` — adapt payment gateway
- Remove tools you don't need (e.g., returns if you don't support returns)

### Step 5: Create Site Knowledge Base
Copy `lib/site-knowledge.ts`. Replace all entries with your own:
- Business overview, contact info, policies
- Shipping/delivery info, payment methods
- FAQ answers, help center content

### Step 6: Create the ChatWidget
Copy `components/ChatWidget.tsx` and `components/MarkdownMessage.tsx`. Customize:
- **Colors** — change `emerald-600` to your brand color
- **Widget title** — change `WIDGET_TITLE`
- **Initial greeting** message
- **Quick reply suggestions**
- **Product card links** — adjust `/products/${slug}` URL pattern

### Step 7: Mount the Widget
In your store layout:
```tsx
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false });
// Add <ChatWidget /> to the layout JSX
```

### Step 8: (Optional) Add Voice Chat
Copy `app/api/chat/transcribe/route.ts` and `app/api/chat/speak/route.ts`. These work with the same `GROQ_API_KEY`.

### Step 9: (Optional) Swap LLM Provider

**For OpenAI:**
```typescript
const LLM_API_URL = 'https://api.openai.com/v1/chat/completions';
const LLM_MODEL = 'gpt-4o-mini';
// Use OPENAI_API_KEY instead of GROQ_API_KEY
```

**For local Ollama:**
```typescript
const LLM_API_URL = 'http://localhost:11434/v1/chat/completions';
const LLM_MODEL = 'llama3.1';
// No API key needed
```

**For Together AI:**
```typescript
const LLM_API_URL = 'https://api.together.xyz/v1/chat/completions';
const LLM_MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
// Use TOGETHER_API_KEY
```

The chat handler uses the standard OpenAI chat completions format, so any compatible provider works with just a URL + model change.

---

## Quick Reference — What Each File Does

| File | Purpose | Lines |
|------|---------|-------|
| `app/api/chat/route.ts` | Core handler: auth, rate limit, LLM call, tool execution, persistence | ~1200 |
| `lib/chat-tools.ts` | All tool implementations: product search, order tracking, order creation, etc. | ~750 |
| `lib/site-knowledge.ts` | Static knowledge base entries about your business | ~600 |
| `components/ChatWidget.tsx` | Full chat UI: widget, messages, products, orders, voice, feedback | ~1070 |
| `components/MarkdownMessage.tsx` | Lightweight markdown renderer for chat messages | ~160 |
| `app/api/chat/transcribe/route.ts` | Speech-to-text via Groq Whisper | ~50 |
| `app/api/chat/speak/route.ts` | Text-to-speech via Groq TTS | ~65 |

---

*Built by Doctor Barns Tech*
