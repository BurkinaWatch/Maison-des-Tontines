import { Response, NextFunction } from "express";
export declare class AuditController {
    queryLogs(req: any, res: Response, next: NextFunction): Promise<void>;
    getLog(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=audit.controller.d.ts.map