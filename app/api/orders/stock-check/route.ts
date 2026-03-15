import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        const clientId = getClientIdentifier(req);
        const rateLimitResult = checkRateLimit(`stock-check:${clientId}`, RATE_LIMITS.payment);
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { orderId } = await req.json();
        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const { data: orderItems, error } = await supabaseAdmin
            .from('order_items')
            .select('quantity, product_id, products(name, quantity, status)')
            .eq('order_id', orderId);

        if (error || !orderItems) {
            return NextResponse.json({ issues: [] });
        }

        const issues: { productName: string; requested: number; available: number }[] = [];
        for (const item of orderItems) {
            const product = (item as any).products;
            if (!product) continue;
            if (product.status !== 'active') {
                issues.push({ productName: product.name, requested: item.quantity, available: 0 });
            } else if (product.quantity < item.quantity) {
                issues.push({ productName: product.name, requested: item.quantity, available: product.quantity });
            }
        }

        return NextResponse.json({ issues });
    } catch (err: any) {
        console.error('[Stock Check] Error:', err.message);
        return NextResponse.json({ issues: [] });
    }
}
