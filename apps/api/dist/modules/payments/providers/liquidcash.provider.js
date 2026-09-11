/**
 * Deliberately fails closed until LiquidCash's official API contract is supplied.
 * No endpoint or payload is guessed here.
 */
export class LiquidCashProvider {
    name = "liquidcash";
    type = "LIQUIDCASH";
    async initiatePayment(_request) {
        return {
            success: false,
            providerRef: "",
            status: "FAILED",
            message: "LiquidCash is not configured with its official API contract",
        };
    }
    async checkPaymentStatus(providerRef) {
        return { status: "UNAVAILABLE", amount: 0, transactionId: providerRef };
    }
    async verifyWebhook(_payload, _signature) {
        return { valid: false, payload: null, error: "LiquidCash webhook contract is not configured" };
    }
    async refund(providerRef, _amount) {
        return { success: false, providerRef, status: "FAILED", message: "Refunds are not configured" };
    }
}
//# sourceMappingURL=liquidcash.provider.js.map