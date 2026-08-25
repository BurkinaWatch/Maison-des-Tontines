import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { AdminController } from "./admin.controller.js";

const router = Router();
const controller = new AdminController();
router.use(authMiddleware, requireRole("ADMIN", "SUPERVISOR"));
router.get("/overview", controller.overview);
router.get("/users", controller.users);
router.get("/tontines", controller.tontines);
router.get("/payments", controller.payments);
router.get("/disputes", controller.disputes);
router.patch("/users/:userId/suspend", validate(z.object({ reason: z.string().max(500).optional() })), controller.suspendUser);
export default router;