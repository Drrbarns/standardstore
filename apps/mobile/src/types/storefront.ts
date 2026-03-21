export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
};

export type StorefrontImage = {
  url: string;
  position: number | null;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  compare_at_price: number | null;
  quantity: number | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  categories: StorefrontCategory | StorefrontCategory[] | null;
  product_images: StorefrontImage[] | null;
};
