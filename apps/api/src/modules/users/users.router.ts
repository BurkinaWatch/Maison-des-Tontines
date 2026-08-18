import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { UsersController } from "./users.controller.js";

const router = Router();
const controller = new UsersController();

router.get("/me", authMiddleware, controller.getProfile);
router.patch("/me", authMiddleware, validate(UpdateProfileDto), controller.updateProfile);
router.patch("/me/password", authMiddleware, validate(ChangePasswordDto), controller.changePassword);
router.get("/me/trust-profile", authMiddleware, controller.getTrustProfile);
router.get("/me/tontines", authMiddleware, controller.getUserTontines);

export default router;
