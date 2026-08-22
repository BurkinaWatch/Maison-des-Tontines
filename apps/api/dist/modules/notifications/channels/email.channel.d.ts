import { NotificationChannelInterface } from "./notification-channel.interface.js";
export declare class EmailChannel implements NotificationChannelInterface {
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
//# sourceMappingURL=email.channel.d.ts.map