import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Backup payment verification endpoint.
 * Called from the order-success page when the callback hasn't fired yet.
 * 
 * This checks with Moolre's API if available, and marks the order as paid
 * if the redirect indicates payment_success=true.
 */
export async function POST(req: Request) {
    try {
        const { orderNumber } = await req.json();

        if (!orderNumber) {
            return NextResponse.json({ success: false, message: 'Missing orderNumber' }, { status: 400 });
        }

        console.log('[Verify] Checking payment status for:', orderNumber);

        // 1. Check current order status
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, order_number, payment_status, status, total, email, phone, shipping_address, metadata')
            .eq('order_number', orderNumber)
            .single();

        if (fetchError || !order) {
            console.error('[Verify] Order not found:', orderNumber);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Already paid - no action needed
        if (order.payment_status === 'paid') {
            console.log('[Verify] Order already paid:', orderNumber);
            return NextResponse.json({ 
                success: true, 
                status: order.status,
                payment_status: order.payment_status,
                message: 'Order already paid' 
            });
        }

        // 2. Try to verify with Moolre's API
        // Check payment status via Moolre's transaction check endpoint
        let moolreVerified = false;
        
        if (process.env.MOOLRE_API_USER && process.env.MOOLRE_API_PUBKEY) {
            try {
                const checkResponse = await fetch('https://api.moolre.com/embed/status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-USER': process.env.MOOLRE_API_USER,
                        'X-API-PUBKEY': process.env.MOOLRE_API_PUBKEY
                    },
                    body: JSON.stringify({ externalref: orderNumber })
                });

                if (checkResponse.ok) {
                    const checkResult = await checkResponse.json();
                    console.log('[Verify] Moolre status check result:', JSON.stringify(checkResult));
                    
                    const statusStr = String(checkResult.data?.status || checkResult.status || '').toLowerCase();
                    moolreVerified = 
                        statusStr === 'success' || 
                        statusStr === 'successful' || 
                        statusStr === 'completed' || 
                        statusStr === 'paid' ||
                        checkResult.status === 1;
                }
            } catch (moolreError: any) {
                console.warn('[Verify] Moolre status check failed:', moolreError.message);
            }
        }

        if (!moolreVerified) {
            // Cannot verify - return current status
            console.log('[Verify] Could not verify payment with Moolre for:', orderNumber);
            return NextResponse.json({ 
                success: false, 
                status: order.status,
                payment_status: order.payment_status,
                message: 'Payment not yet confirmed. The callback may still be processing.' 
            });
        }

        // 3. Payment verified by Moolre - mark as paid
        console.log('[Verify] Moolre confirmed payment for:', orderNumber);
        
        const { data: orderJson, error: updateError } = await supabase
            .rpc('mark_order_paid', {
                order_ref: orderNumber,
                moolre_ref: 'verified-from-status-check'
            });

        if (updateError) {
            console.error('[Verify] RPC Error:', updateError.message);
            return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
        }

        // 4. Send notifications
        if (orderJson) {
            try {
                await sendOrderConfirmation(orderJson);
                console.log('[Verify] Notifications sent for:', orderNumber);
            } catch (notifyError: any) {
                console.error('[Verify] Notification failed:', notifyError.message);
            }
        }

        return NextResponse.json({ 
            success: true, 
            status: 'processing',
            payment_status: 'paid',
            message: 'Payment verified and order updated' 
        });

    } catch (error: any) {
        console.error('[Verify] Error:', error.message);
        return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
    }
}
