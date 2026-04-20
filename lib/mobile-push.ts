import { supabaseAdmin } from '@/lib/supabase-admin';

type PushTarget = {
    userId?: string | null;
    email?: string | null;
};

type PushPayload = {
    title: string;
    body: string;
    data?: Record<string, unknown>;
};

async function fetchActiveTokens(target: PushTarget): Promise<string[]> {
    const tokens = new Set<string>();

    if (target.userId) {
        const { data } = await supabaseAdmin
            .from('mobile_push_tokens')
            .select('token')
            .eq('user_id', target.userId)
            .eq('is_active', true);

        for (const row of data || []) {
            if (row.token) tokens.add(row.token);
        }
    }

    if (target.email) {
        const { data } = await supabaseAdmin
            .from('mobile_push_tokens')
            .select('token')
            .eq('email', target.email.toLowerCase().trim())
            .eq('is_active', true);

        for (const row of data || []) {
            if (row.token) tokens.add(row.token);
        }
    }

    return Array.from(tokens);
}

async function deactivateTokens(tokens: string[]) {
    if (tokens.length === 0) return;
    await supabaseAdmin
        .from('mobile_push_tokens')
        .update({ is_active: false })
        .in('token', tokens);
}

export async function sendMobilePush(target: PushTarget, payload: PushPayload) {
    const tokens = await fetchActiveTokens(target);
    if (tokens.length === 0) return { sent: 0, inactive: 0 };

    const messages = tokens.map((token) => ({
        to: token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
    });

    const result = await response.json();
    const data = Array.isArray(result?.data) ? result.data : [];
    const inactiveTokens: string[] = [];

    data.forEach((entry: any, idx: number) => {
        if (entry?.status === 'error' && entry?.details?.error === 'DeviceNotRegistered') {
            const token = tokens[idx];
            if (token) inactiveTokens.push(token);
        }
    });

    await deactivateTokens(inactiveTokens);
    return { sent: messages.length, inactive: inactiveTokens.length };
}
