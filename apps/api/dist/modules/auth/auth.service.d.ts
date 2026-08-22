import { AuthResponse } from "../../types/user.types.js";
import { RegisterInput, VerifyOtpInput, LoginInput } from "../dto/register.dto.js";
export declare class AuthService {
    private prisma;
    private env;
    requestOtp(phone: string): Promise<{
        message: string;
    }>;
    verifyOtp(data: VerifyOtpInput): Promise<AuthResponse>;
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