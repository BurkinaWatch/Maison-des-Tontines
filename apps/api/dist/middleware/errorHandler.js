import { logger } from "../config/logger.js";
import { ZodError } from "zod";
export function errorHandler(err, req, res, next) {
    logger.error("Unhandled error", {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });
    const statusCode = err instanceof ZodError ? 400 : err.statusCode || 500;
    const message = err instanceof ZodError
        ? "Invalid request data"
        : err.message || "Internal server error";
    res.status(statusCode).json({
        error: statusCode >= 500 ? "Internal server error" : err.name || "Error",
        message,
        ...(err instanceof ZodError && {
            details: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
    });
}
//# sourceMappingURL=errorHandler.js.map