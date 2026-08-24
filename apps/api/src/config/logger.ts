import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import type { Writable } from "node:stream";
import { getEnv } from "./env.js";

const env = getEnv();

const SENSITIVE_KEY =
  /(?:email|phone|ip(?:address)?|stack|user[-_]?agent|authorization|token|password|secret)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const PHONE = /(?<!\w)(?:\+\d[\d\s().-]{6,}\d|\d{7,15})(?!\w)/g;
const STACK_TRACE = /(?:^|\n)\s*at\s+.+(?:\n|$)/;

function redactText(value: string): string {
  return value
    .replace(EMAIL, "[REDACTED_EMAIL]")
    .replace(IPV4, "[REDACTED_IP]")
    .replace(PHONE, "[REDACTED_PHONE]");
}

export function sanitizeForLogs(
  value: unknown,
  environment: "development" | "test" | "production" = env.NODE_ENV,
  key?: string,
): unknown {
  if (SENSITIVE_KEY.test(key ?? "")) return "[REDACTED]";
  if (typeof value === "string") {
    if (environment === "production" && STACK_TRACE.test(value)) {
      return "[REDACTED_STACK]";
    }
    return redactText(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLogs(item, environment));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitizeForLogs(childValue, environment, childKey),
      ])
    );
  }
  return value;
}

const securityFormat = (
  environment: "development" | "test" | "production" = env.NODE_ENV,
) =>
  winston.format((info) => {
    const sanitized = sanitizeForLogs(info, environment) as winston.Logform.TransformableInfo;
    if (environment !== "development") delete sanitized.stack;
    return sanitized;
  })();

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  securityFormat(),
  winston.format.json()
);

const productionLogFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  securityFormat("production"),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  securityFormat(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

export function createProductionTransports(options: {
  logDirectory?: string;
  consoleStream?: Writable;
} = {}): winston.transport[] {
  const logDirectory = options.logDirectory ?? "logs";

  return [
    new winston.transports.Console({
      format: productionLogFormat,
      ...(options.consoleStream ? { stream: options.consoleStream } : {}),
    }),
    new DailyRotateFile({
      filename: `${logDirectory}/application-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: productionLogFormat,
    }),
    new DailyRotateFile({
      filename: `${logDirectory}/error-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",
      format: productionLogFormat,
    }),
  ];
}

const transports: winston.transport[] =
  env.NODE_ENV === "test"
    ? [
        new winston.transports.Console({
          format: logFormat,
        }),
      ]
    : env.NODE_ENV === "development"
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : createProductionTransports();

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transports,
  exitOnError: false,
});

export function requestLogger(req: any, res: any, next: any) {
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
