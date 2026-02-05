import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/notifications';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

// Ensure we use Service Role Key for admin-level updates (marking paid)
// This bypasses RLS policies which might block 'update' for anonymous users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Log which key type is being used (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('Callback using:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    console.log('[Callback] POST request received at', new Date().toISOString());
    
    try {
        // Rate limiting for callbacks (more relaxed as it's from payment provider)
        const clientId = getClientIdentifier(req);
        const rateLimitResult = checkRateLimit(`callback:${clientId}`, RATE_LIMITS.callback);
        
        if (!rateLimitResult.success) {
            console.warn('[Callback] Rate limited:', clientId);
            return NextResponse.json(
                { success: false, message: 'Too many requests' },
                { status: 429 }
            );
        }

        let body: any = {};
        const contentType = req.headers.get('content-type') || '';
        console.log('[Callback] Content-Type:', contentType);

        // Robust Body Parsing (JSON vs Form Data)
        try {
            if (contentType.includes('application/json')) {
                body = await req.json();
            } else if (contentType.includes('form')) { // x-www-form-urlencoded or multipart
                const formData = await req.formData();
                body = Object.fromEntries(formData.entries());
            } else {
                // Fallback: Try JSON first, then raw text
                const rawText = await req.text();
                console.log('[Callback] Raw body (first 500 chars):', rawText.substring(0, 500));
                try {
                    body = JSON.parse(rawText);
                } catch {
                    // Try URL-encoded parsing
                    try {
                        const params = new URLSearchParams(rawText);
                        body = Object.fromEntries(params.entries());
                    } catch {
                        console.warn('[Callback] Could not parse body');
                    }
                }
            }
        } catch (parseError) {
            console.error('[Callback] Body parsing failed');
            return NextResponse.json({ success: false, message: 'Invalid Request Body' }, { status: 400 });
        }

        // Log callback received with all keys for debugging
        console.log('[Callback] Body keys:', Object.keys(body).join(', '));
        console.log('[Callback] Received - Status:', body.status, '| Ref:', body.externalref || body.orderRef || body.external_reference);

        const {
            status,
            externalref, // This is our orderNumber
            orderRef, // Alternate key?
            external_reference, // Alternate key?
            reference,   // Moolre's reference
        } = body;

        // Determine the correct merchant order reference
        const merchantOrderRef = externalref || orderRef || external_reference;

        if (!merchantOrderRef) {
            console.error('[Callback] Missing order reference. Keys received:', Object.keys(body).join(', '));
            return NextResponse.json({ success: false, message: 'Invalid callback data: Missing order reference' }, { status: 400 });
        }

        // Verify payment success (flexible match: case-insensitive string or number 1)
        const statusStr = String(status || '').toLowerCase();
        const isSuccess =
            statusStr === 'success' ||
            statusStr === 'successful' ||
            statusStr === 'completed' ||
            statusStr === 'paid' ||
            status == 1 ||
            statusStr === '1';

        if (isSuccess) {
            console.log(`[Callback] Processing successful payment for Order ${merchantOrderRef}`);

            // VERIFICATION: First check if order exists and is in valid state
            const { data: existingOrder, error: fetchError } = await supabase
                .from('orders')
                .select('id, order_number, payment_status, total')
                .eq('order_number', merchantOrderRef)
                .single();

            if (fetchError || !existingOrder) {
                console.error('[Callback] Order verification failed - not found:', merchantOrderRef);
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }

            // Check if order is in a valid state for payment
            if (existingOrder.payment_status === 'paid') {
                console.log('[Callback] Order already paid, skipping:', merchantOrderRef);
                return NextResponse.json({ success: true, message: 'Order already processed' });
            }

            // Optional: Verify amount matches (if amount is in callback)
            const callbackAmount = body.amount ? parseFloat(body.amount) : null;
            if (callbackAmount && Math.abs(callbackAmount - existingOrder.total) > 0.01) {
                console.error('[Callback] Amount mismatch! Expected:', existingOrder.total, 'Got:', callbackAmount);
                // Log but don't block - amount could be formatted differently
            }

            // Use RPC to Update Order Status (Works with Anon Key via Security Definer)
            const { data: orderJson, error: updateError } = await supabase
                .rpc('mark_order_paid', {
                    order_ref: merchantOrderRef,
                    moolre_ref: reference
                });

            if (updateError) {
                console.error('[Callback] RPC Error:', updateError.message);
                return NextResponse.json({ success: false, message: 'Database update failed' }, { status: 500 });
            }

            if (!orderJson) {
                console.error('[Callback] Order not found after RPC:', merchantOrderRef);
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }

            console.log('[Callback] Order updated successfully. ID:', orderJson.id, '| Phone:', orderJson.phone ? 'Present' : 'Missing');

            // Update customer stats
            try {
                if (orderJson.email) {
                    await supabase.rpc('update_customer_stats', {
                        p_customer_email: orderJson.email,
                        p_order_total: orderJson.total
                    });
                    console.log('[Callback] Customer stats updated for:', orderJson.email);
                }
            } catch (statsError: any) {
                console.error('[Callback] Customer stats update failed:', statsError.message);
                // Non-blocking
            }

            // Send notification directly
            try {
                console.log('[Callback] Triggering notifications for order:', orderJson.order_number);
                await sendOrderConfirmation(orderJson);
                console.log('[Callback] Notifications sent successfully');
            } catch (notifyError: any) {
                console.error('[Callback] Notification failed:', notifyError.message);
                // Non-blocking - still return success for the payment
            }

            return NextResponse.json({ success: true, message: 'Payment verified and Order Updated' });

        } else {
            // Payment failed or pending
            console.log(`[Callback] Payment not successful for ${merchantOrderRef}, status: ${status}`);

            await supabase
                .from('orders')
                .update({
                    payment_status: 'failed',
                    metadata: {
                        moolre_reference: reference,
                        failure_reason: body.message || 'Payment failed'
                    }
                })
                .eq('order_number', merchantOrderRef);

            return NextResponse.json({ success: false, message: 'Payment reported as not successful' });
        }

    } catch (error: any) {
        console.error('[Callback] Critical Error:', error.message);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Some payment providers send callbacks via GET with query params
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    console.log('[Callback] GET request received. Params:', JSON.stringify(params));
    
    // If there are query params that look like a callback, process them
    if (params.status && (params.externalref || params.orderRef || params.external_reference)) {
        console.log('[Callback] Processing GET callback with params');
        
        const merchantOrderRef = params.externalref || params.orderRef || params.external_reference;
        const statusStr = String(params.status || '').toLowerCase();
        const isSuccess =
            statusStr === 'success' ||
            statusStr === 'successful' ||
            statusStr === 'completed' ||
            statusStr === 'paid' ||
            params.status == '1' ||
            statusStr === '1';

        if (isSuccess && merchantOrderRef) {
            console.log(`[Callback GET] Processing successful payment for Order ${merchantOrderRef}`);

            // Verify order exists
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id, order_number, payment_status, total')
                .eq('order_number', merchantOrderRef)
                .single();

            if (!existingOrder) {
                console.error('[Callback GET] Order not found:', merchantOrderRef);
                return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
            }

            if (existingOrder.payment_status === 'paid') {
                return NextResponse.json({ success: true, message: 'Order already processed' });
            }

            const { data: orderJson, error: updateError } = await supabase
                .rpc('mark_order_paid', {
                    order_ref: merchantOrderRef,
                    moolre_ref: params.reference || params.ref || 'GET-callback'
                });

            if (updateError) {
                console.error('[Callback GET] RPC Error:', updateError.message);
                return NextResponse.json({ success: false, message: 'Database update failed' }, { status: 500 });
            }

            if (orderJson) {
                console.log('[Callback GET] Order updated successfully:', orderJson.id);
                
                // Send notifications
                try {
                    await sendOrderConfirmation(orderJson);
                    console.log('[Callback GET] Notifications sent');
                } catch (notifyError: any) {
                    console.error('[Callback GET] Notification failed:', notifyError.message);
                }
            }

            return NextResponse.json({ success: true, message: 'Payment verified and Order Updated (GET)' });
        }
    }
    
    return NextResponse.json({ message: 'Moolre callback endpoint ready', timestamp: new Date().toISOString() });
}
