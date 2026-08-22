export declare function getNextDate(startDate: Date, frequency: string, occurrence: number): Date;
export declare function calculateDueDate(startDate: Date, frequency: string, sequence: number): Date;
export declare function isOverdue(dueDate: Date, now?: Date): boolean;
export declare function calculateLateDays(dueDate: Date, now?: Date): number;
export declare function getCycleWindow(startDate: Date, endDate: Date): {
    start: Date;
    end: Date;
};
export declare function daysUntil(date: Date): number;
export declare function formatDate(date: Date | string): string;
export declare function formatDateTime(date: Date | string): string;
//# sourceMappingURL=date.d.ts.map