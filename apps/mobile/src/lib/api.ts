import { env } from "../config/env";
import type { StorefrontProduct } from "../types/storefront";
import type { CartItem } from "../context/CartContext";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API request failed (${response.status}): ${text || response.statusText}`
    );
  }

  return (await response.json()) as T;
}

export async function getProducts(limit = 30): Promise<StorefrontProduct[]> {
  return request<StorefrontProduct[]>(`/api/storefront/products?limit=${limit}`);
}

export type CheckoutInput = {
  userId: string | null;
  email: string;
  phone: string;
  fullName: string;
  items: CartItem[];
  paymentMethod: "cash_on_delivery" | "moolre";
};

export type CreatedOrder = {
  id: string;
  order_number: string;
  total: number;
  email?: string;
};

export type OrderLookup = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal?: number;
  shipping_total?: number;
  discount_total?: number;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    metadata?: { image?: string; slug?: string };
  }>;
};

function generateOrderNumber() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MOB-${stamp}-${random}`;
}

export async function createOrderFromCart(input: CheckoutInput) {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingTotal = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shippingTotal;
  const orderNumber = generateOrderNumber();
  const [firstName, ...rest] = input.fullName.trim().split(" ");
  const lastName = rest.join(" ");

  const shippingAddress = {
    firstName: firstName || "Mobile",
    lastName: lastName || "Customer",
    email: input.email,
    phone: input.phone,
    address: "N/A",
    city: "N/A",
    region: "N/A",
    country: "Ghana",
  };

  const items = input.items.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    variant_name: null,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
    metadata: {
      image: item.image ?? null,
      slug: item.slug,
    },
  }));

  return request<{ order: CreatedOrder }>(
    "/api/orders/create",
    "POST",
    {
      orderData: {
        order_number: orderNumber,
        user_id: input.userId,
        email: input.email,
        phone: input.phone,
        status: "pending",
        payment_status: "pending",
        currency: "GHS",
        subtotal,
        tax_total: 0,
        shipping_total: shippingTotal,
        discount_total: 0,
        total,
        shipping_method: "standard",
        payment_method: input.paymentMethod,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        metadata: {
          guest_checkout: !input.userId,
          source: "mobile_app",
          payment_method: input.paymentMethod,
        },
      },
      items,
    }
  );
}

export async function initializeMoolrePayment(input: {
  orderNumber: string;
  customerEmail: string;
  redirectUrl: string;
}) {
  return request<{ success: boolean; url: string; reference?: string; externalRef?: string }>(
    "/api/payment/moolre",
    "POST",
    {
      orderId: input.orderNumber,
      customerEmail: input.customerEmail,
      redirectUrl: input.redirectUrl,
    }
  );
}

export async function verifyMoolrePayment(input: {
  orderNumber: string;
  externalRef?: string | null;
}) {
  return request<{
    success: boolean;
    status?: string;
    payment_status?: string;
    message?: string;
  }>("/api/payment/moolre/verify", "POST", {
    orderNumber: input.orderNumber,
    externalRef: input.externalRef ?? undefined,
  });
}

export async function lookupOrder(input: {
  orderId: string;
  includeItems?: boolean;
}) {
  return request<{ order: OrderLookup }>("/api/orders/lookup", "POST", {
    orderId: input.orderId,
    includeItems: input.includeItems ?? false,
  });
}

export async function trackMobileEvent(input: {
  event: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await request<{ ok: boolean }>("/api/mobile/analytics", "POST", input);
  } catch {
    // Analytics should never block user flows.
  }
}

export async function registerPushToken(input: {
  token: string;
  userId?: string | null;
  email?: string | null;
  platform?: string;
  deviceName?: string;
  appVersion?: string;
}) {
  try {
    await request<{ ok: boolean }>("/api/mobile/push/register", "POST", input);
  } catch {
    // Push token registration should be best-effort.
  }
}
