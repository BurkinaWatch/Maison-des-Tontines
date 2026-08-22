import { Queue } from "bullmq";
export declare const reminderQueue: Queue<any, any, string, any, any, string>;
export declare const lateCheckQueue: Queue<any, any, string, any, any, string>;
export declare const reconciliationQueue: Queue<any, any, string, any, any, string>;
export declare function startWorkers(): Promise<void>;
//# sourceMappingURL=reminder.job.d.ts.map