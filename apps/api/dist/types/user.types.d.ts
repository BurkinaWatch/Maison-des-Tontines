export interface UserSummary {
    id: string;
    phone: string;
    email: string | null;
    name: string;
    role: string;
    status: string;
    createdAt: Date;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        phone: string;
        email: string | null;
        name: string;
        role: string;
    };
}
export interface TrustScoreSummary {
    score: number;
    cyclesCompleted: number;
    paymentsOnTime: number;
    paymentsLate: number;
    disputesResolved: number;
    disputesUnresolved: number;
    memberSince: Date;
}
//# sourceMappingURL=user.types.d.ts.map