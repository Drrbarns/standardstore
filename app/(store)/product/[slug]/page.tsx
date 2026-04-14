import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data } = isUUID
    ? await supabase.from('products').select('is_porials').or(`id.eq.${slug},slug.eq.${slug}`).maybeSingle()
    : await supabase.from('products').select('is_porials').eq('slug', slug).maybeSingle();

  if (data?.is_porials === true) {
    notFound();
  }

  return <ProductDetailClient slug={slug} />;
}
