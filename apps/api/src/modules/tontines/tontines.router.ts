import { Router } from "express";
import { TontinesController } from "./tontines.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware, requireTontineMembership, requireTontineRole } from "../../middleware/auth.js";
import { CreateTontineDto, UpdateTontineDto } from "./dto/tontines.dto.js";

const router = Router();
const controller = new TontinesController();

router.use(authMiddleware);

router.post("/", validate(CreateTontineDto), controller.createTontine);
router.get("/", controller.getTontines);
router.get("/:id", controller.getTontine);
router.patch("/:id", requireTontineRole("id", "ORGANIZER", "ADMIN"), validate(UpdateTontineDto), controller.updateTontine);
router.delete("/:id", requireTontineRole("id", "ORGANIZER", "ADMIN"), controller.deleteTontine);
router.get("/:id/members", requireTontineMembership("id"), controller.getTontineMembers);
router.get("/:id/rules", requireTontineMembership("id"), controller.getTontineRules);

export default router;
