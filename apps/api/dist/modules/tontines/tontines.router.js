import { Router } from "express";
import { TontinesController } from "./tontines.controller.js";
import { authMiddleware } from "../../middleware/auth.js";
const router = Router();
const controller = new TontinesController();
router.use(authMiddleware);
router.post("/", controller.createTontine);
router.get("/", controller.getTontines);
router.get("/:id", controller.getTontine);
router.patch("/:id", controller.updateTontine);
router.delete("/:id", controller.deleteTontine);
router.get("/:id/members", controller.getTontineMembers);
router.get("/:id/rules", controller.getTontineRules);
export default router;
//# sourceMappingURL=tontines.router.js.map