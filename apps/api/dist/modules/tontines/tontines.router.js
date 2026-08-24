import { Router } from "express";
import { TontinesController } from "./tontines.controller.js";
import { authMiddleware, requireTontineMembership, requireTontineRole } from "../../middleware/auth.js";
const router = Router();
const controller = new TontinesController();
router.use(authMiddleware);
router.post("/", controller.createTontine);
router.get("/", controller.getTontines);
router.get("/:id", controller.getTontine);
router.patch("/:id", requireTontineRole("id", "ORGANIZER", "ADMIN"), controller.updateTontine);
router.delete("/:id", requireTontineRole("id", "ORGANIZER", "ADMIN"), controller.deleteTontine);
router.get("/:id/members", requireTontineMembership("id"), controller.getTontineMembers);
router.get("/:id/rules", requireTontineMembership("id"), controller.getTontineRules);
export default router;
//# sourceMappingURL=tontines.router.js.map