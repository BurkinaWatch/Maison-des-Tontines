import { Response } from "express";
import { authService } from "./auth.service.js";
import type {
  RequestOtpInput,
  VerifyOtpInput,
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
} from "./dto/register.dto.js";

export class AuthController {
  async requestOtp(req: any, res: Response, next: any) {
    try {
      const { phone } = req.body as RequestOtpInput;
      const result = await authService.requestOtp(phone);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: any, res: Response, next: any) {
    try {
      const { phone, otp } = req.body as VerifyOtpInput;
      const result = await authService.verifyOtp({ phone, otp });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req: any, res: Response, next: any) {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: any, res: Response, next: any) {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: any, res: Response, next: any) {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: any, res: Response, next: any) {
    try {
      const userId = req.userId;
      const { refreshToken } = req.body;
      const result = await authService.logout(userId!, refreshToken || "");
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: any, res: Response, next: any) {
    try {
      const userId = req.userId;
      const result = await authService.logoutAll(userId!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
