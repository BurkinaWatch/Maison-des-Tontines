import { Response, NextFunction } from "express";
export declare class NotificationsController {
    getNotifications(req: any, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: any, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    markAllAsRead(req: any, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=notifications.controller.d.ts.map