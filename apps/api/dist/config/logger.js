import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { getEnv } from "./env.js";
const env = getEnv();
const SENSITIVE_KEY = /(?:email|phone|ip(?:address)?|stack|useragent|authorization|token|password|secret)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const PHONE = /(?<!\w)(?:\+?\d[\d\s().-]{6,}\d)(?!\w)/g;
function redactText(value) {
    return value
        .replace(EMAIL, "[REDACTED_EMAIL]")
        .replace(IPV4, "[REDACTED_IP]")
        .replace(PHONE, "[REDACTED_PHONE]");
}
function sanitize(value, key) {
    if (SENSITIVE_KEY.test(key ?? ""))
        return "[REDACTED]";
    if (typeof value === "string")
        return redactText(value);
    if (Array.isArray(value))
        return value.map((item) => sanitize(item));
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
            childKey,
            sanitize(childValue, childKey),
        ]));
    }
    return value;
}
const securityFormat = winston.format((info) => {
    const sanitized = sanitize(info);
    if (env.NODE_ENV !== "development")
        delete sanitized.stack;
    return sanitized;
});
const logFormat = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston.format.errors({ stack: true }), winston.format.splat(), securityFormat(), winston.format.json());
const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), securityFormat(), winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
        metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
}));
const transports = [
    new winston.transports.Console({
        format: env.NODE_ENV === "development" ? consoleFormat : logFormat,
    }),
];
if (env.NODE_ENV !== "test") {
    transports.push(new DailyRotateFile({
        filename: "logs/application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: logFormat,
    }), new DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
        format: logFormat,
    }));
}
export const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    transports,
    exitOnError: false,
});
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info("HTTP Request", {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
        });
    });
    next();
}
//# sourceMappingURL=logger.js.map