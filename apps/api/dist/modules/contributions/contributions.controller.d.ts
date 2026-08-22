import { Response, NextFunction } from "express";
export declare class ContributionsController {
    recordContribution(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getContributions(req: any, res: Response, next: NextFunction): Promise<void>;
    getMyContributions(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=contributions.controller.d.ts.map