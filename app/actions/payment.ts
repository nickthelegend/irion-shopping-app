"use server"

export async function initiateIrionment(amount: number, description: string) {
    const clientId = process.env.Irion_CLIENT_ID;
    const clientSecret = process.env.Irion_CLIENT_SECRET;
    const apiUrl = process.env.MERCHANT_API_URL || "http://localhost:3001/api/bills/create";

    console.log('[PAYMENT-DEBUG] initiateIrionment called:', { amount, description, clientId: clientId?.substring(0, 10) + '...', apiUrl });

    try {
        const requestBody = {
            amount,
            description,
            metadata: {
                source: "Syndicate_Equip_Store",
                order_date: new Date().toISOString()
            }
        };
        console.log('[PAYMENT-DEBUG] Sending request body:', requestBody);

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': clientId || '',
                'x-client-secret': clientSecret || ''
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        console.log('[PAYMENT-DEBUG] Merchant API response:', data);

        if (data.error) {
            return { error: data.error };
        }

        return { checkoutUrl: data.checkoutUrl };
    } catch (e: any) {
        console.error("[PAYMENT-DEBUG] Payment initiation failed:", e);
        return { error: "Connection to Irion Hub failed." };
    }
}
