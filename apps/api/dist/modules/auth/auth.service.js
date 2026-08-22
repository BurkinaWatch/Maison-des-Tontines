import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../../config/database.js";
import { getEnv } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { validatePhone, normalizePhone } from "../../utils/phone.js";
export class AuthService {
    prisma = getPrisma();
    env = getEnv();
    async register(data) {
        const normalizedPhone = normalizePhone(data.phone);
        const normalizedEmail = normalizeEmail(data.email);
        if (!validatePhone(normalizedPhone)) {
            throw createAuthError("Invalid phone number format", 400);
        }
        const existingUser = await this.prisma.user.findFirst({
            where: { phone: normalizedPhone },
        });
        if (existingUser) {
            throw createAuthError("Phone number already registered", 409);
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingEmail) {
            throw createAuthError("Email address already registered", 409);
        }
        const passwordHash = await bcrypt.hash(data.password, 12);
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
        logger.info("User registered", { userId: user.id, email: user.email });
        return this.generateTokens(user.id, user.phone, user.role, user.email, user.name);
    }
    async login(data) {
        const normalizedEmail = normalizeEmail(data.email);
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            throw createAuthError("Invalid email address or password", 401);
        }
        const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!passwordMatch) {
            throw createAuthError("Invalid email address or password", 401);
        }
        if (user.status !== "ACTIVE") {
            throw createAuthError(`Account is ${user.status.toLowerCase()}. Please contact support.`, 403);
        }
        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
        });
        return this.generateTokens(user.id, user.phone, user.role, user.email, user.name);
    }
    async refreshToken(refreshToken) {
        const env = this.env;
        try {
            const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
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
            const tokens = await this.generateTokens(user.id, user.phone, user.role, user.email, user.name);
            return tokens;
        }
        catch {
            throw createAuthError("Invalid or expired refresh token", 401);
        }
    }
    async logout(userId, refreshToken) {
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
    async logoutAll(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { message: "Logged out from all devices" };
    }
    async generateTokens(userId, phone, role, email = null, name = phone) {
        const env = this.env;
        const accessPayload = {
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
            jti: randomUUID(),
        };
        const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRY,
        });
        // Store refresh token
        const expiresAt = new Date();
        if (env.JWT_REFRESH_EXPIRY.endsWith("d")) {
            const days = parseInt(env.JWT_REFRESH_EXPIRY);
            expiresAt.setDate(expiresAt.getDate() + days);
        }
        else if (env.JWT_REFRESH_EXPIRY.endsWith("h")) {
            const hours = parseInt(env.JWT_REFRESH_EXPIRY);
            expiresAt.setHours(expiresAt.getHours() + hours);
        }
        else {
            expiresAt.setDate(expiresAt.getDate() + 7);
        }
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt,
            },
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
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function createAuthError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
}
//# sourceMappingURL=auth.service.js.map