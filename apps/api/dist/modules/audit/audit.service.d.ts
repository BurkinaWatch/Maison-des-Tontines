export declare class AuditService {
    log(actorId: string | null, actorRole: string, action: string, resource: string, resourceId?: string, metadata?: any, ipAddress?: string): Promise<void>;
    query(filters: {
        actorId?: string;
        resource?: string;
        resourceId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        logs: {
            id: string;
            createdAt: Date;
            actorRole: string;
            action: string;
            resource: string;
            resourceId: string | null;
            metadata: string;
            ipAddress: string;
            actorId: string | null;
        }[];
        total: number;
    }>;
}
export declare const auditService: AuditService;
//# sourceMappingURL=audit.service.d.ts.map