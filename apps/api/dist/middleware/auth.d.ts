import { Request, Response, NextFunction } from "express";
export interface AuthPayload {
    sub: string;
    role: string;
    phone: string;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthPayload;
    userId?: string;
}
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function requireRole(...allowedRoles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function requireTontineRole(tontineId: string, ...allowedRoles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map