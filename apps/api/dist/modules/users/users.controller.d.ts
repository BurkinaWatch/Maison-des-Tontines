import { Response, NextFunction } from "express";
export declare class UsersController {
    getProfile(req: any, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: any, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getTrustProfile(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getUserTontines(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map