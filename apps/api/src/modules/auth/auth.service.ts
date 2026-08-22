import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPrisma } from "../../config/database.js";
import { getEnv } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { AuthResponse, AuthPayload } from "../../types/user.types.js";
import { generateOtp, validatePhone, normalizePhone } from "../../utils/phone.js";
import { generateIdempotencyKey } from "../../utils/idempotency.js";
import { RegisterInput, VerifyOtpInput, LoginInput, RefreshTokenInput } from "../dto/register.dto.js";
import { randomUUID } from "crypto";

export class AuthService {
  private prisma = getPrisma();
  private env = getEnv();

  async requestOtp(phone: string): Promise<{ message: string }> {
    const normalizedPhone = normalizePhone(phone);

    if (!validatePhone(normalizedPhone)) {
      throw new Error("Invalid phone number format");
    }

    const isMockOtp = this.env.NODE_ENV !== "production" && this.env.MOCK_PROVIDER_ENABLED === "true";
    if (!isMockOtp) {
      throw new Error("SMS delivery is not configured. Configure an SMS provider before requesting OTP codes.");
    }

    const otp = generateOtp(this.env.OTP_LENGTH);
    const otpExpiry = new Date(Date.now() + this.env.OTP_EXPIRY_MINUTES * 60 * 1000);

    logger.info("OTP requested", {
      phone: normalizedPhone,
      expiresAt: otpExpiry.toISOString(),
      mode: "development-mock",
    });

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "otp_verifications" (id, "phone", "otp", "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT ("phone") DO UPDATE SET "otp" = $3, "expiresAt" = $4, "createdAt" = NOW()`,
      randomUUID(),
      normalizedPhone,
      otp,
      otpExpiry
    );

    return { message: "OTP generated successfully", developmentOtp: otp };
  }

  async verifyOtp(data: VerifyOtpInput): Promise<AuthResponse> {
    const normalizedPhone = normalizePhone(data.phone);

    const verification = await this.prisma.$queryRawUnsafe<any>(
      `SELECT * FROM "otp_verifications" WHERE "phone" = $1 LIMIT 1`,
      normalizedPhone
    );

    if (!verification || verification[0]?.otp !== data.otp) {
      throw new Error("Invalid or expired OTP");
    }

    if (new Date() > new Date(verification[0].expiresAt)) {
      throw new Error("OTP has expired");
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new Error("User not found. Please register first.");
    }

    await this.prisma.$executeRawUnsafe(
      `DELETE FROM "otp_verifications" WHERE "phone" = $1`,
      normalizedPhone
    );

    return this.generateTokens(user.id, user.phone, user.role);
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const normalizedPhone = normalizePhone(data.phone);

    if (!validatePhone(normalizedPhone)) {
      throw new Error("Invalid phone number format");
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      throw new Error("Phone number already registered");
    }

    if (data.otp) {
      const verification = await this.prisma.$queryRawUnsafe<any>(
        `SELECT * FROM "otp_verifications" WHERE "phone" = $1 LIMIT 1`,
        normalizedPhone
      );

      if (!verification || verification[0]?.otp !== data.otp) {
        throw new Error("Invalid or expired OTP");
      }

      if (new Date() > new Date(verification[0].expiresAt)) {
        throw new Error("OTP has expired");
      }
    }

    const passwordHash = await bcrypt.hash(data.password ?? randomUUID(), 12);

    const user = await this.prisma.user.create({
      data: {
        phone: normalizedPhone,
        email: data.email,
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
        metadata: { phone: user.phone, name: user.name },
        ipAddress: "system",
      },
    });

    if (data.otp) {
      await this.prisma.$executeRawUnsafe(
        `DELETE FROM "otp_verifications" WHERE "phone" = $1`,
        normalizedPhone
      );
    }

    logger.info("User registered", { userId: user.id, phone: user.phone });
    return this.generateTokens(user.id, user.phone, user.role);
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

  private generateTokens(userId: string, phone: string, role: string): AuthResponse {
    const env = this.env;

    const accessPayload: AuthPayload = {
      sub: userId,
      role,
      phone,
    };

    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });

    const refreshPayload = {
      sub: userId,
      type: "refresh",
    };

    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
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
        email: null,
        name: phone,
        role,
      },
    };
  }
}

export const authService = new AuthService();
