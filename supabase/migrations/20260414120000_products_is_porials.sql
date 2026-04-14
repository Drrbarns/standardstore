-- Exhibition-only products: shown only on /porials-pitch, not in shop/cart/PDP.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_porials boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.is_porials IS 'When true, product appears only on the Porials Pitch page (no PDP, no cart).';

CREATE INDEX IF NOT EXISTS idx_products_is_porials ON public.products (is_porials)
  WHERE is_porials = true;
