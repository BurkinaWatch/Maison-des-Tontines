import { PrismaClient } from "@prisma/client";
let prisma;
export function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: [
                { level: "query", emit: "event" },
                { level: "error", emit: "event" },
                { level: "warn", emit: "event" },
            ],
        });
    }
    return prisma;
}
//# sourceMappingURL=database.js.map