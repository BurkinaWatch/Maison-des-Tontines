import { Router } from "express";
import { TontinesController } from "./tontines.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware, requireRole } from "../../middleware/auth.js";
import { CreateTontineDto, UpdateTontineDto } from "./dto/tontines.dto.js";

const router = Router();
const controller = new TontinesController();

router.use(authMiddleware);

router.post("/", validate(CreateTontineDto), controller.createTontine);
router.get("/", controller.getTontines);
router.get("/:id", controller.getTontine);
router.patch("/:id", validate(UpdateTontineDto), controller.updateTontine);
router.delete("/:id", controller.deleteTontine);
router.get("/:id/members", controller.getTontineMembers);
router.get("/:id/rules", controller.getTontineRules);

export default router;
