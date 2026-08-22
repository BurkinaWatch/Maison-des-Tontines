import { Response, NextFunction } from "express";
export declare class VotingController {
    createVote(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    castVote(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    closeVote(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=voting.controller.d.ts.map