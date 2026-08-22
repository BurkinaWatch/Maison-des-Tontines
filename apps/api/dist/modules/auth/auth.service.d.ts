import { AuthResponse } from "../../types/user.types.js";
import type { RegisterInput, LoginInput } from "./dto/register.dto.js";
export declare class AuthService {
    private prisma;
    private env;
    register(data: RegisterInput): Promise<AuthResponse>;
    login(data: LoginInput): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map