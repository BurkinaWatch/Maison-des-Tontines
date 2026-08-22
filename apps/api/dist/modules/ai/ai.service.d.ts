export declare class AIService {
    generateInsight(tontineId: string): Promise<{
        type: string;
        priority: string;
        data: {
            message: string;
            contributionRate: number;
            potReceived: number | null;
            potAmount: number | null;
        };
    }[]>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map