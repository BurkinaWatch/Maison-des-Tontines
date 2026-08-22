import { Response } from "express";
export declare class AuthController {
    requestOtp(req: any, res: Response, next: any): Promise<void>;
    verifyOtp(req: any, res: Response, next: any): Promise<void>;
    register(req: any, res: Response, next: any): Promise<void>;
    login(req: any, res: Response, next: any): Promise<void>;
    refreshToken(req: any, res: Response, next: any): Promise<void>;
    logout(req: any, res: Response, next: any): Promise<void>;
    logoutAll(req: any, res: Response, next: any): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map