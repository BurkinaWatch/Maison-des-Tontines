import { Response, NextFunction } from "express";
export declare function rbacMiddleware(allowedRoles: string[]): (req: any, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rbac.d.ts.map