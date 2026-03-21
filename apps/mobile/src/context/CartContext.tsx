import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontProduct } from "../types/storefront";

const CART_STORAGE_KEY = "mobile_cart_items_v1";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addProduct: (product: StorefrontProduct) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function firstImageUrl(product: StorefrontProduct) {
  return product.product_images?.[0]?.url || undefined;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    async function loadCart() {
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed);
      } catch (error) {
        console.error("Failed to load cart from storage:", error);
      }
    }

    void loadCart();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addProduct = (product: StorefrontProduct) => {
      const unitPrice = product.price;
      if (unitPrice == null) return;

      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [
          ...prev,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: unitPrice,
            image: firstImageUrl(product),
            quantity: 1,
          },
        ];
      });
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    };

    const clearCart = () => {
      setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      itemCount,
      subtotal,
      addProduct,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
