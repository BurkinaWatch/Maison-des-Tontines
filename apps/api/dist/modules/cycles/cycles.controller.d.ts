import { Response, NextFunction } from "express";
export declare class CyclesController {
    getTontineCycles(req: any, res: Response, next: NextFunction): Promise<void>;
    getCycle(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    advanceCycle(req: any, res: Response, next: NextFunction): Promise<void>;
    completeCycle(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=cycles.controller.d.ts.map