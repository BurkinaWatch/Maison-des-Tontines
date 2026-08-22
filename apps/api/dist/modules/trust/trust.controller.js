import { getPrisma } from "../../config/database.js";
export class TrustController {
    async getMyTrustProfile(req, res, next) {
        try {
            const userId = req.userId;
            const profile = await getPrisma().trustProfile.findUnique({
                where: { userId },
            });
            if (!profile) {
                return res.status(404).json({ error: "Trust profile not found" });
            }
            res.json({ profile });
        }
        catch (error) {
            next(error);
        }
    }
    async getTrustProfile(req, res, next) {
        try {
            const { userId } = req.params;
            const profile = await getPrisma().trustProfile.findUnique({
                where: { userId },
            });
            if (!profile) {
                return res.status(404).json({ error: "Trust profile not found" });
            }
            res.json({ profile });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=trust.controller.js.map