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

  return request<{ order: { id: string; order_number: string; total: number } }>(
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
        payment_method: "cash_on_delivery",
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        metadata: {
          guest_checkout: !input.userId,
          source: "mobile_app",
        },
      },
      items,
    }
  );
}
