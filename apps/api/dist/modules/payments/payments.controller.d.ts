import { Response, NextFunction } from "express";
export declare class PaymentsController {
    private providers;
    getProviders(req: any, res: Response, next: NextFunction): Promise<void>;
    initiateContributionPayment(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    initiatePayout(req: any, res: Response, next: NextFunction): Promise<void>;
    checkPaymentStatus(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=payments.controller.d.ts.map