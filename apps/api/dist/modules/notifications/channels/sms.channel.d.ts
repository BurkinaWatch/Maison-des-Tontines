import { NotificationChannelInterface } from "./notification-channel.interface.js";
export declare class SMSChannel implements NotificationChannelInterface {
    send(notification: {
        userId: string;
        title: string;
        body: string;
        data?: any;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=sms.channel.d.ts.map