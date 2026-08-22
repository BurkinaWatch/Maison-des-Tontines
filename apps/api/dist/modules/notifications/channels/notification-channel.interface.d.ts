export interface NotificationChannelInterface {
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
//# sourceMappingURL=notification-channel.interface.d.ts.map