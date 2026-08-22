import { Response, NextFunction } from "express";
export declare class DisputesController {
    openDispute(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    resolveDispute(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getDisputes(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=disputes.controller.d.ts.map