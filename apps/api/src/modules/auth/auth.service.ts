import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { getPrisma } from "../../config/database.js";
import { getEnv } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { AuthResponse } from "../../types/user.types.js";
import { AuthPayload } from "../../middleware/auth.js";
import { generateOtp, validatePhone, normalizePhone } from "../../utils/phone.js";
import type { RegisterInput, VerifyOtpInput, LoginInput } from "./dto/register.dto.js";
import { randomUUID } from "crypto";
import { sendVerificationEmail } from "./email.service.js";

export class AuthService {
  private prisma = getPrisma();
  private env = getEnv();

  async requestOtp(email: string): Promise<{ message: string; developmentOtp?: string }> {
    const normalizedEmail = normalizeEmail(email);
    const otp = generateOtp(this.env.OTP_LENGTH);
    const otpExpiry = new Date(Date.now() + this.env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpVerification.upsert({
      where: { email: normalizedEmail },
      create: { id: randomUUID(), email: normalizedEmail, otp, expiresAt: otpExpiry },
      update: { otp, expiresAt: otpExpiry, createdAt: new Date() },
    });

    try {
      await sendVerificationEmail({
        to: normalizedEmail,
        from: this.env.EMAIL_FROM,
        otp,
        expiresInMinutes: this.env.OTP_EXPIRY_MINUTES,
      });
    } catch (error) {
      await this.prisma.otpVerification.delete({ where: { email: normalizedEmail } }).catch(() => undefined);
      logger.error("Verification email delivery failed", {
        email: normalizedEmail,
        error: (error as Error).message,
      });
      throw new Error("Unable to send the verification email. Please try again.");
    }

    logger.info("Verification email sent", { email: normalizedEmail, expiresAt: otpExpiry.toISOString() });
    return {
      message: "Verification code sent by email",
      ...(this.env.NODE_ENV !== "production" && this.env.MOCK_PROVIDER_ENABLED === "true"
        ? { developmentOtp: otp }
        : {}),
    };
  }

  async verifyOtp(data: VerifyOtpInput): Promise<AuthResponse> {
    const normalizedEmail = normalizeEmail(data.email);
    const verification = await this.prisma.otpVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!verification || verification.otp !== data.otp) {
      throw new Error("Invalid or expired OTP");
    }

    if (new Date() > verification.expiresAt) {
      throw new Error("OTP has expired");
    }

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new Error("User not found. Please register first.");
    }

    await this.prisma.otpVerification.delete({ where: { email: normalizedEmail } });

    return this.generateTokens(user.id, user.phone, user.role, user.email, user.name);
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const normalizedPhone = normalizePhone(data.phone);
    const normalizedEmail = normalizeEmail(data.email);

    if (!validatePhone(normalizedPhone)) {
      throw new Error("Invalid phone number format");
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      throw new Error("Phone number already registered");
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      throw new Error("Email address already registered");
    }

    const verification = await this.prisma.otpVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!verification || verification.otp !== data.otp) {
      throw new Error("Invalid or expired OTP");
    }

    if (new Date() > verification.expiresAt) {
      throw new Error("OTP has expired");
    }

    const passwordHash = await bcrypt.hash(data.password ?? randomUUID(), 12);

    const user = await this.prisma.user.create({
      data: {
        phone: normalizedPhone,
        email: normalizedEmail,
        name: data.name,
        passwordHash,
      },
    });

    // Create trust profile
    await this.prisma.trustProfile.create({
      data: {
        userId: user.id,
        memberSince: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: "USER_REGISTERED",
        resource: "user",
        resourceId: user.id,
        metadata: JSON.stringify({ phone: user.phone, name: user.name }),
        ipAddress: "system",
      },
    });

    await this.prisma.otpVerification.delete({ where: { email: normalizedEmail } });

    logger.info("User registered", { userId: user.id, email: user.email });
    return this.generateTokens(user.id, user.phone, user.role, user.email, user.name);
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const normalizedPhone = normalizePhone(data.phone);

    const user = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new Error("Invalid phone number or password");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error("Invalid phone number or password");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Please contact support.`);
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return this.generateTokens(user.id, user.phone, user.role);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const env = this.env;

    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        sub: string;
        type: "refresh";
      };

      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw new Error("Invalid refresh token");
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== "ACTIVE") {
        throw new Error("User not found or inactive");
      }

      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const tokens = this.generateTokens(user.id, user.phone, user.role);
      return tokens;
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return { message: "Logged out successfully" };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: "Logged out from all devices" };
  }

  private generateTokens(
    userId: string,
    phone: string,
    role: string,
    email: string | null = null,
    name: string = phone
  ): AuthResponse {
    const env = this.env;

    const accessPayload: AuthPayload = {
      sub: userId,
      role,
      phone,
    };

    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
    });

    const refreshPayload = {
      sub: userId,
      type: "refresh",
    };

    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
    });

    // Store refresh token
    const expiresAt = new Date();
    if (env.JWT_REFRESH_EXPIRY.endsWith("d")) {
      const days = parseInt(env.JWT_REFRESH_EXPIRY);
      expiresAt.setDate(expiresAt.getDate() + days);
    } else if (env.JWT_REFRESH_EXPIRY.endsWith("h")) {
      const hours = parseInt(env.JWT_REFRESH_EXPIRY);
      expiresAt.setHours(expiresAt.getHours() + hours);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    }).catch((err) => {
      logger.error("Failed to store refresh token", { error: (err as Error).message });
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        phone,
        email,
        name,
        role,
      },
    };
  }
}

export const authService = new AuthService();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
