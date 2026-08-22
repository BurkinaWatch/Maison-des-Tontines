export class WaveProvider {
    name = "wave";
    type = "WAVE";
    async initiatePayment(request) {
        try {
            const response = await fetch("https://api.wave.com/v1/payment/request", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: request.amount,
                    currency: request.currency,
                    phone_number: request.phoneNumber,
                    external_id: request.reference,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    providerRef: "",
                    status: "FAILED",
                    message: data.message || "Payment initiation failed",
                };
            }
            return {
                success: true,
                providerRef: data.id,
                status: data.status,
            };
        }
        catch (error) {
            return {
                success: false,
                providerRef: "",
                status: "FAILED",
                message: error.message,
            };
        }
    }
    async checkPaymentStatus(providerRef) {
        try {
            const response = await fetch(`https://api.wave.com/v1/payment/${providerRef}`, {
                headers: {
                    "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
                },
            });
            const data = await response.json();
            return {
                status: data.status,
                amount: data.amount,
                transactionId: providerRef,
                paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
            };
        }
        catch (error) {
            return {
                status: "ERROR",
                amount: 0,
                transactionId: providerRef,
            };
        }
    }
    async verifyWebhook(payload, signature) {
        try {
            const crypto = await import("crypto");
            const expectedSignature = crypto
                .createHmac("sha256", process.env.WAVE_WEBHOOK_SECRET || "")
                .update(JSON.stringify(payload))
                .digest("hex");
            if (signature !== expectedSignature) {
                return {
                    valid: false,
                    payload: null,
                    error: "Invalid webhook signature",
                };
            }
            return {
                valid: true,
                payload,
            };
        }
        catch (error) {
            return {
                valid: false,
                payload: null,
                error: error.message,
            };
        }
    }
    async refund(providerRef, amount) {
        try {
            const response = await fetch(`https://api.wave.com/v1/payment/${providerRef}/refund`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.WAVE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount,
                }),
            });
            const data = await response.json();
            return {
                success: response.ok,
                providerRef: data.id || providerRef,
                status: data.status,
            };
        }
        catch (error) {
            return {
                success: false,
                providerRef: "",
                status: "FAILED",
                message: error.message,
            };
        }
    }
}
//# sourceMappingURL=wave.provider.js.map