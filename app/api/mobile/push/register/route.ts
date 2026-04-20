import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const token = typeof body?.token === 'string' ? body.token : null;
        const userId = typeof body?.userId === 'string' ? body.userId : null;
        const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null;
        const platform = typeof body?.platform === 'string' ? body.platform : null;
        const deviceName = typeof body?.deviceName === 'string' ? body.deviceName : null;
        const appVersion = typeof body?.appVersion === 'string' ? body.appVersion : null;

        if (!token) {
            return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('mobile_push_tokens')
            .upsert({
                token,
                user_id: userId,
                email,
                platform,
                device_name: deviceName,
                app_version: appVersion,
                is_active: true,
                last_seen_at: new Date().toISOString()
            }, { onConflict: 'token' });

        if (error) {
            console.error('[MobilePushRegister] upsert failed:', error.message);
            return NextResponse.json({ ok: false, error: 'Failed to save push token' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error?.message || 'Internal error' }, { status: 500 });
    }
}
