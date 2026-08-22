import { Response, NextFunction } from "express";
export declare class TontinesController {
    private engine;
    createTontine(req: any, res: Response, next: NextFunction): Promise<void>;
    getTontines(req: any, res: Response, next: NextFunction): Promise<void>;
    getTontine(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updateTontine(req: any, res: Response, next: NextFunction): Promise<void>;
    deleteTontine(req: any, res: Response, next: NextFunction): Promise<void>;
    getTontineMembers(req: any, res: Response, next: NextFunction): Promise<void>;
    getTontineRules(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tontines.controller.d.ts.map