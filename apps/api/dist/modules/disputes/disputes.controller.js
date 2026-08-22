import { getPrisma } from "../../config/database.js";
import { logger } from "../../config/logger.js";
export class DisputesController {
    async openDispute(req, res, next) {
        try {
            const userId = req.userId;
            const { tontineId, cycleId, contributionId, type, description } = req.body;
            const membership = await getPrisma().tontineMember.findFirst({
                where: { tontineId, userId, status: "ACTIVE" },
            });
            if (!membership) {
                return res.status(403).json({ error: "Not a member of this tontine" });
            }
            const dispute = await getPrisma().dispute.create({
                data: {
                    tontineId,
                    cycleId,
                    contributionId,
                    type,
                    description,
                    status: "OPEN",
                    openedById: userId,
                },
                include: {
                    openedBy: { select: { id: true, phone: true, name: true } },
                },
            });
            logger.info("Dispute opened", { disputeId: dispute.id, tontineId, userId });
            res.status(201).json({ dispute });
        }
        catch (error) {
            next(error);
        }
    }
    async resolveDispute(req, res, next) {
        try {
            const { disputeId } = req.params;
            const { decision } = req.body;
            const userId = req.userId;
            const dispute = await getPrisma().dispute.findUnique({
                where: { id: disputeId },
            });
            if (!dispute) {
                return res.status(404).json({ error: "Dispute not found" });
            }
            const updatedDispute = await getPrisma().dispute.update({
                where: { id: disputeId },
                data: {
                    status: "RESOLVED",
                    resolvedAt: new Date(),
                    resolvedById: userId,
                    decision,
                },
                include: {
                    openedBy: { select: { id: true, phone: true, name: true } },
                    resolvedBy: { select: { id: true, phone: true, name: true } },
                },
            });
            await getPrisma().trustProfile.updateMany({
                where: { userId: dispute.openedById },
                data: { disputesResolved: { increment: 1 } },
            });
            logger.info("Dispute resolved", { disputeId });
            res.json({ dispute: updatedDispute });
        }
        catch (error) {
            next(error);
        }
    }
    async getDisputes(req, res, next) {
        try {
            const { tontineId, status } = req.query;
            const where = {};
            if (tontineId)
                where.tontineId = tontineId;
            if (status)
                where.status = status;
            const disputes = await getPrisma().dispute.findMany({
                where,
                include: {
                    openedBy: { select: { id: true, phone: true, name: true } },
                    resolvedBy: { select: { id: true, phone: true, name: true } },
                },
                orderBy: { openedAt: "desc" },
            });
            res.json({ disputes });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=disputes.controller.js.map