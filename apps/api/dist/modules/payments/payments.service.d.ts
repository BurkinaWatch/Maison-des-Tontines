export declare class PaymentsService {
    getProviders(): Promise<{
        type: string;
        id: string;
        name: string;
        createdAt: Date;
    }[]>;
    initiatePayment(data: any, userId: string): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: string;
        currency: string;
        amount: number;
        providerRef: string;
        direction: string;
        providerId: string;
    }>;
}
//# sourceMappingURL=payments.service.d.ts.map