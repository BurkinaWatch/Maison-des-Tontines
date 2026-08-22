import { getPrisma } from "../../config/database.js";
export class PaymentsService {
    async getProviders() {
        return getPrisma().paymentProvider.findMany({
            where: { isActive: true },
            select: { id: true, name: true, type: true, createdAt: true },
        });
    }
    async initiatePayment(data, userId) {
        return getPrisma().paymentTransaction.create({
            data: {
                ...data,
                userId,
            },
        });
    }
}
//# sourceMappingURL=payments.service.js.map