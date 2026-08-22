import { getPrisma } from "../../config/database.js";
import { tontineEngineModule } from "../tontines/tontine-engine/module.js";
export class ContributionsController {
    async recordContribution(req, res, next) {
        try {
            const { cycleId } = req.body;
            const memberId = req.params.membershipId;
            const userId = req.userId;
            const cycle = await getPrisma().tontineCycle.findUnique({
                where: { id: cycleId },
                include: { tontine: true },
            });
            if (!cycle) {
                return res.status(404).json({ error: "Cycle not found" });
            }
            const contribution = await tontineEngineModule.getContributionService().recordContribution(cycle.tontineId, cycleId, memberId, req.body.amount, req.body.method, req.body.providerRef);
            res.status(201).json({ contribution });
        }
        catch (error) {
            next(error);
        }
    }
    async getContributions(req, res, next) {
        try {
            const { cycleId } = req.params;
            const contributions = await getPrisma().contribution.findMany({
                where: { cycleId },
                include: {
                    member: { include: { user: { select: { id: true, phone: true, name: true } } } },
                },
                orderBy: { declaredAt: "desc" },
            });
            res.json({ contributions });
        }
        catch (error) {
            next(error);
        }
    }
    async getMyContributions(req, res, next) {
        try {
            const userId = req.userId;
            const contributions = await getPrisma().contribution.findMany({
                where: { member: { userId, status: { not: "CANCELLED" } } },
                include: {
                    cycle: { include: { tontine: { select: { id: true, name: true } } } },
                },
                orderBy: { declaredAt: "desc" },
                take: 50,
            });
            res.json({ contributions });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=contributions.controller.js.map