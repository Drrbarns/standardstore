import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const event = typeof body?.event === 'string' ? body.event : null;
        const payload = body?.payload ?? null;

        if (!event) {
            return NextResponse.json({ ok: false, error: 'Missing event' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('mobile_event_logs')
            .insert({
                event,
                payload: payload ?? {}
            });

        if (error) {
            console.error('[MobileAnalytics] insert failed:', error.message);
            return NextResponse.json({ ok: false, error: 'Failed to store event' }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error?.message || 'Internal error' }, { status: 500 });
    }
}
