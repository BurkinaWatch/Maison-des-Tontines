import { getPrisma } from "../config/database.js";
import { logger } from "../config/logger.js";
import { Queue, Worker } from "bullmq";
import { getEnv } from "../config/env.js";
const env = getEnv();
export const reminderQueue = new Queue("reminders", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
});
export const lateCheckQueue = new Queue("late-checks", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
});
export const reconciliationQueue = new Queue("reconciliation", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
});
export async function startWorkers() {
    const reminderWorker = new Worker("reminders", async (job) => {
        const { type, tontineId, cycleId, userId } = job.data;
        if (type === "cycle-reminder") {
            const cycle = await getPrisma().tontineCycle.findUnique({
                where: { id: cycleId },
                include: { tontine: true, contributions: true },
            });
            if (!cycle)
                return;
            const members = await getPrisma().tontineMember.findMany({
                where: { tontineId, status: "ACTIVE" },
                include: { user: true },
            });
            for (const member of members) {
                const hasContributed = cycle.contributions.some((c) => c.memberId === member.id);
                if (!hasContributed) {
                    await getPrisma().notification.create({
                        data: {
                            userId: member.userId,
                            type: "REMINDER",
                            channel: "PUSH",
                            title: "Contribution Reminder",
                            body: `Please contribute to ${cycle.name} before it closes.`,
                            data: { tontineId, cycleId },
                            status: "PENDING",
                        },
                    });
                }
            }
        }
    }, { connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD } });
    const lateCheckWorker = new Worker("late-checks", async (job) => {
        const { cycleId } = job.data;
        const contributions = await getPrisma().contribution.findMany({
            where: { cycleId, status: { in: ["PENDING", "PROCESSING"] } },
            include: { cycle: true },
        });
        for (const contribution of contributions) {
            if (contribution.declaredAt) {
                const daysSince = Math.floor((Date.now() - new Date(contribution.declaredAt).getTime()) / (1000 * 60 * 60 * 24));
                if (daysSince > 1 && contribution.status === "PROCESSING") {
                    await getPrisma().contribution.update({
                        where: { id: contribution.id },
                        data: { status: "LATE" },
                    });
                }
            }
        }
    }, { connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD } });
    const reconciliationWorker = new Worker("reconciliation", async (job) => {
        const { cycleId } = job.data;
        const cycle = await getPrisma().tontineCycle.findUnique({
            where: { id: cycleId },
            include: { tontine: true, contributions: true },
        });
        if (!cycle)
            return;
        const totalPaid = cycle.contributions
            .filter((c) => c.status === "PAID" || c.status === "LATE")
            .reduce((sum, c) => sum + Number(c.amount), 0);
        const memberCount = cycle.contributions.length;
        const expectedTotal = Number(cycle.tontine.contributionAmount) * memberCount;
        if (Math.abs(totalPaid - expectedTotal) > 0.01) {
            await getPrisma().notification.create({
                data: {
                    userId: cycle.tontine.createdById,
                    type: "SYSTEM",
                    channel: "PUSH",
                    title: "Reconciliation Alert",
                    body: `Cycle ${cycle.name} has a discrepancy: expected ${expectedTotal}, received ${totalPaid}`,
                    data: { cycleId, totalPaid, expectedTotal },
                    status: "PENDING",
                },
            });
        }
    }, { connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD } });
    logger.info("BullMQ workers started");
}
//# sourceMappingURL=reminder.job.js.map