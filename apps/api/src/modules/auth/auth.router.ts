import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { LoginDto, RegisterDto, RefreshTokenDto } from "./dto/register.dto.js";

const router = Router();
const controller = new AuthController();

router.post("/register", authRateLimiter, validate(RegisterDto), controller.register);
router.post("/login", authRateLimiter, validate(LoginDto), controller.login);
router.post("/refresh", validate(RefreshTokenDto), controller.refreshToken);
router.post("/logout", authMiddleware, validate(RefreshTokenDto), controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);

export default router;
