import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { tontineEngineModule } from "./tontine-engine/module.js";
export class TontinesController {
    engine = tontineEngineModule.getEngine();
    async createTontine(req, res, next) {
        try {
            const userId = req.userId;
            const data = req.body;
            const tontine = await getPrisma().tontine.create({
                data: {
                    ...data,
                    startDate: new Date(data.startDate),
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    createdById: userId,
                    rules: data.rules
                        ? Object.entries(data.rules).map(([key, value]) => ({
                            key,
                            value: String(value),
                            type: typeof value === "number" ? "NUMBER" : "STRING",
                        }))
                        : [],
                },
                include: { rules: true, members: true },
            });
            await getPrisma().tontineMember.create({
                data: {
                    tontineId: tontine.id,
                    userId,
                    role: "ORGANIZER",
                    status: "ACTIVE",
                    payoutOrder: 0,
                },
            });
            logger.info("Tontine created", { tontineId: tontine.id, userId });
            res.status(201).json({ tontine });
        }
        catch (error) {
            next(error);
        }
    }
    async getTontines(req, res, next) {
        try {
            const userId = req.userId;
            const { status, type, page = 1, limit = 20 } = req.query;
            const where = {};
            if (status)
                where.status = status;
            if (type)
                where.type = type;
            const tontines = await getPrisma().tontine.findMany({
                where,
                include: {
                    members: { where: { userId, status: "ACTIVE" } },
                    cycles: { orderBy: { sequence: "desc" }, take: 1 },
                    _count: { select: { members: true } },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            });
            const total = await getPrisma().tontine.count({ where });
            res.json({
                tontines: tontines.map((t) => ({
                    ...t,
                    memberCount: t._count.members,
                    currentCycle: t.cycles[0] || null,
                })),
                total,
                page: Number(page),
                limit: Number(limit),
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTontine(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.userId;
            const tontine = await getPrisma().tontine.findFirst({
                where: { id, members: { some: { userId, status: "ACTIVE" } } },
                include: {
                    rules: true,
                    members: {
                        include: { user: { select: { id: true, phone: true, email: true, name: true } } },
                        orderBy: { payoutOrder: "asc" },
                    },
                    cycles: { orderBy: { sequence: "asc" } },
                    votes: { orderBy: { openedAt: "desc" }, take: 5 },
                },
            });
            if (!tontine) {
                return res.status(404).json({ error: "Tontine not found" });
            }
            res.json({ tontine });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTontine(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const tontine = await getPrisma().tontine.update({
                where: { id },
                data: {
                    ...(data.name && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.status && { status: data.status }),
                    ...(data.maxMembers !== undefined && { maxMembers: data.maxMembers }),
                    ...(data.rules && {
                        rules: {
                            deleteMany: {},
                            create: Object.entries(data.rules).map(([key, value]) => ({
                                key,
                                value: String(value),
                                type: typeof value === "number" ? "NUMBER" : "STRING",
                            })),
                        },
                    }),
                    updatedAt: new Date(),
                },
                include: { rules: true },
            });
            logger.info("Tontine updated", { tontineId: id });
            res.json({ tontine });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTontine(req, res, next) {
        try {
            const { id } = req.params;
            await getPrisma().tontine.delete({ where: { id } });
            logger.info("Tontine deleted", { tontineId: id });
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    async getTontineMembers(req, res, next) {
        try {
            const { id } = req.params;
            const members = await getPrisma().tontineMember.findMany({
                where: { tontineId: id, status: "ACTIVE" },
                include: {
                    user: { select: { id: true, phone: true, email: true, name: true } },
                },
                orderBy: { payoutOrder: "asc" },
            });
            res.json({ members });
        }
        catch (error) {
            next(error);
        }
    }
    async getTontineRules(req, res, next) {
        try {
            const { id } = req.params;
            const rules = await getPrisma().tontineRule.findMany({
                where: { tontineId: id },
            });
            res.json({ rules });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=tontines.controller.js.map