export declare class TrustService {
    getTrustScore(userId: string): Promise<{
        score: number;
        reason: string;
        profile?: undefined;
    } | {
        score: any;
        profile: any;
        reason?: undefined;
    }>;
    updateTrustScore(userId: string, action: "on_time" | "late" | "dispute_resolved" | "dispute_opened"): Promise<void>;
}
export declare const trustService: TrustService;
//# sourceMappingURL=trust-profile.engine.d.ts.map