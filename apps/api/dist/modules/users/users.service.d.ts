export declare class UsersService {
    getUserById(userId: string): Promise<{
        status: string;
        trustProfile: {
            id: string;
            userId: string;
            disputesResolved: number;
            cyclesCompleted: number;
            paymentsOnTime: number;
            paymentsLate: number;
            disputesUnresolved: number;
            memberSince: Date;
            score: number;
        } | null;
        id: string;
        role: string;
        name: string;
        phone: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string | null;
    }): Promise<{
        status: string;
        id: string;
        role: string;
        name: string;
        phone: string;
        email: string | null;
        updatedAt: Date;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        status: string;
        id: string;
        role: string;
        name: string;
        phone: string;
        email: string | null;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTrustProfile(userId: string): Promise<{
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
    getUserTontines(userId: string): Promise<{
        id: string;
        name: string;
        type: string;
        status: string;
        contributionAmount: number;
        currency: string;
        frequency: string;
        startDate: Date;
        role: string;
        joinedAt: Date;
        payoutOrder: number | null;
        currentCycle: {
            status: string;
            id: string;
            tontineId: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sequence: number;
            startDate: Date;
            endDate: Date | null;
            beneficiaryMemberId: string | null;
            potAmount: number | null;
            potReceived: number | null;
        };
    }[]>;
}
export declare const usersService: UsersService;
//# sourceMappingURL=users.service.d.ts.map