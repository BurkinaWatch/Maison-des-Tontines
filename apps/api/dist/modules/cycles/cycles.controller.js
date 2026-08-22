import { getPrisma } from "../../config/database.js";
export class CyclesController {
    async getTontineCycles(req, res, next) {
        try {
            const { tontineId } = req.params;
            const cycles = await getPrisma().tontineCycle.findMany({
                where: { tontineId },
                include: {
                    beneficiary: { include: { user: { select: { id: true, phone: true, name: true } } } },
                    contributions: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
                    payouts: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
                },
                orderBy: { sequence: "asc" },
            });
            res.json({ cycles });
        }
        catch (error) {
            next(error);
        }
    }
    async getCycle(req, res, next) {
        try {
            const { tontineId, cycleId } = req.params;
            const cycle = await getPrisma().tontineCycle.findFirst({
                where: { id: cycleId, tontineId },
                include: {
                    beneficiary: { include: { user: { select: { id: true, phone: true, name: true } } } },
                    contributions: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
                    payouts: { include: { member: { include: { user: { select: { id: true, phone: true, name: true } } } } } },
                },
            });
            if (!cycle) {
                return res.status(404).json({ error: "Cycle not found" });
            }
            res.json({ cycle });
        }
        catch (error) {
            next(error);
        }
    }
    async advanceCycle(req, res, next) {
        try {
            const { tontineId, cycleId } = req.params;
            const result = await tontineEngineModule.getCycleService().advanceCycle(tontineId, cycleId);
            res.json({ cycle: result });
        }
        catch (error) {
            next(error);
        }
    }
    async completeCycle(req, res, next) {
        try {
            const { tontineId, cycleId } = req.params;
            const result = await tontineEngineModule.getCycleService().completeCycle(tontineId, cycleId);
            res.json({ cycle: result });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=cycles.controller.js.map