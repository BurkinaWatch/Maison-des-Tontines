import { NotificationChannelInterface } from "./notification-channel.interface.js";
export declare class PushChannel implements NotificationChannelInterface {
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
//# sourceMappingURL=push.channel.d.ts.map