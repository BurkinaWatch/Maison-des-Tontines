import { Queue } from "bullmq";
import { getEnv } from "../../config/env.js";

export async function enqueueReminderJob(type: string, data: any) {
  const env = getEnv();
  const queue = new Queue("reminders", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
  });
  await queue.add(type, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
}

export async function enqueueLateCheckJob(cycleId: string) {
  const env = getEnv();
  const queue = new Queue("late-checks", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
  });
  await queue.add("check-late", { cycleId }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
}

export async function enqueueReconciliationJob(cycleId: string) {
  const env = getEnv();
  const queue = new Queue("reconciliation", {
    connection: { host: env.REDIS_HOST, port: env.REDIS_PORT, password: env.REDIS_PASSWORD },
  });
  await queue.add("reconcile", { cycleId }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  });
}
