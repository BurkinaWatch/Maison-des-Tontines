import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { getEnv } from "../config/env.js";
import { logger } from "../config/logger.js";

const env = getEnv();

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "You have exceeded the request limit. Please try again later.",
  },
  skip: (req) => {
    return env.NODE_ENV === "test";
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many authentication attempts",
    message: "Please try again later.",
  },
});
