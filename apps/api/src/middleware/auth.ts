import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";
import { getPrisma } from "../config/database.js";
import { logger } from "../config/logger.js";

export interface AuthPayload {
  sub: string;
  role: string;
  phone: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
  userId?: string;
  membership?: { id: string; tontineId: string; userId: string; role: string; status: string };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const env = getEnv();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    req.userId = payload.sub;
    next();
  } catch (error) {
    logger.warn("Invalid token", { error: (error as Error).message });
    return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const env = getEnv();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    req.userId = payload.sub;
  } catch {
    // Silently ignore invalid token for optional auth
  }

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUser = await getPrisma().user.findUnique({
      where: { id: req.userId! },
      select: { role: true, status: true },
    });
    if (!currentUser || currentUser.status !== "ACTIVE") {
      return res.status(403).json({ error: "Forbidden", message: "Account is inactive" });
    }
    if (!allowedRoles.includes(currentUser.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

export function requireTontineRole(
  tontineIdParam: string,
  ...allowedRoles: string[]
) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const prisma = getPrisma();
    const tontineId = req.params[tontineIdParam];
    if (!tontineId) {
      return res.status(400).json({ error: "Missing tontine identifier" });
    }

    try {
      const membership = await prisma.tontineMember.findFirst({
        where: {
          tontineId,
          userId: req.userId!,
          status: "ACTIVE",
        },
      });

      if (!membership) {
        return res.status(403).json({ error: "Forbidden", message: "Not a member of this tontine" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Required tontine role: ${allowedRoles.join(", ")}`,
        });
      }

      req.membership = membership;
      next();
    } catch (error) {
      logger.error("Tontine role check failed", { error: (error as Error).message });
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
