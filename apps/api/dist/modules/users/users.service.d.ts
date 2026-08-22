export declare class UsersService {
    getUserById(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string | null;
    }): Promise<any>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<any>;
    getTrustProfile(userId: string): Promise<any>;
    getUserTontines(userId: string): Promise<any>;
}
export declare const usersService: UsersService;
//# sourceMappingURL=users.service.d.ts.map