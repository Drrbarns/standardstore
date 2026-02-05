'use server';

export async function testSmsAction(phone: string, message: string) {
    try {
        console.log('Testing SMS to:', phone);

        // Capture environment state for debugging
        const envDebug = {
            MOOLRE_SMS_API_USER: process.env.MOOLRE_SMS_API_USER ? 'Set' : 'Unset',
            MOOLRE_SMS_API_KEY: process.env.MOOLRE_SMS_API_KEY ? 'Set' : 'Unset',
            MOOLRE_SMS_API_PUBKEY: process.env.MOOLRE_SMS_API_PUBKEY ? 'Set' : 'Unset',
            MOOLRE_API_USER: process.env.MOOLRE_API_USER ? 'Set' : 'Unset',
            MOOLRE_API_PUBKEY: process.env.MOOLRE_API_PUBKEY ? 'Set' : 'Unset',
            MOOLRE_API_KEY: process.env.MOOLRE_API_KEY ? 'Set' : 'Unset',
        };

        // Get credentials
        const isCustomSmsUser = !!process.env.MOOLRE_SMS_API_USER;
        const smsUser = process.env.MOOLRE_SMS_API_USER || process.env.MOOLRE_API_USER;
        const smsVasKey = process.env.MOOLRE_SMS_API_KEY || process.env.MOOLRE_API_KEY;
        let smsPubKey = process.env.MOOLRE_SMS_API_PUBKEY;
        if (!isCustomSmsUser) {
            smsPubKey = smsPubKey || process.env.MOOLRE_API_PUBKEY;
        }

        if (!smsVasKey || !smsUser) {
            return {
                success: false,
                error: 'Missing credentials: smsVasKey=' + (smsVasKey ? 'present' : 'missing') + ', smsUser=' + (smsUser ? 'present' : 'missing'),
                envOfServer: envDebug
            };
        }

        // Format phone number
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '233' + cleaned.slice(1);
        }
        if (!cleaned.startsWith('233') && cleaned.length === 9) {
            cleaned = '233' + cleaned;
        }
        const recipient = '+' + cleaned;

        // Make direct API call for better error visibility
        const response = await fetch('https://api.moolre.com/open/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-VASKEY': smsVasKey,
                'X-API-USER': smsUser,
                'X-API-PUBKEY': smsPubKey || ''
            },
            body: JSON.stringify({
                type: 1,
                senderid: 'SarahLawson',
                messages: [
                    {
                        recipient: recipient,
                        message: message
                    }
                ]
            })
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            result = { rawResponse: responseText };
        }

        return {
            success: result?.status === 1,
            result,
            formattedPhone: recipient,
            httpStatus: response.status,
            envOfServer: envDebug
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
}
