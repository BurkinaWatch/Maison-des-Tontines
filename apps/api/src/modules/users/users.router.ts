import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { UsersController } from "./users.controller.js";

const router = Router();
const controller = new UsersController();

router.use(authMiddleware);

router.get("/me", controller.getProfile);
router.patch("/me", controller.updateProfile);
router.patch("/me/password", controller.changePassword);
router.get("/me/trust-profile", controller.getTrustProfile);
router.get("/me/tontines", controller.getUserTontines);

export default router;
