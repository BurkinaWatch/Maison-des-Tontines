export declare class TrustService {
    getTrustScore(userId: string): Promise<{
        score: number;
        reason: string;
        profile?: undefined;
    } | {
        score: number;
        profile: {
            id: string;
            userId: string;
            disputesResolved: number;
            cyclesCompleted: number;
            paymentsOnTime: number;
            paymentsLate: number;
            disputesUnresolved: number;
            memberSince: Date;
            score: number;
        };
        reason?: undefined;
    }>;
    updateTrustScore(userId: string, action: "on_time" | "late" | "dispute_resolved" | "dispute_opened"): Promise<void>;
}
export declare const trustService: TrustService;
//# sourceMappingURL=trust.service.d.ts.map