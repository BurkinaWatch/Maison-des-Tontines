import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { authRateLimiter, otpRateLimiter } from "../../middleware/rateLimit.js";
import { RequestOtpDto, VerifyOtpDto, LoginDto, RegisterDto, RefreshTokenDto } from "./dto/register.dto.js";

const router = Router();
const controller = new AuthController();

router.post("/otp/request", otpRateLimiter, validate(RequestOtpDto), controller.requestOtp);
router.post("/otp/verify", validate(VerifyOtpDto), controller.verifyOtp);
router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", authRateLimiter, validate(LoginDto), controller.login);
router.post("/refresh", validate(RefreshTokenDto), controller.refreshToken);
router.post("/logout", authMiddleware, validate(RefreshTokenDto), controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);

export default router;
