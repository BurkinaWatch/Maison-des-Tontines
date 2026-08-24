import { logger } from "../config/logger.js";
export function errorHandler(err, req, res, next) {
    logger.error("Unhandled error", {
        error: err.message,
        method: req.method,
        url: req.url,
    });
    const statusCode = err.statusCode || 500;
    const message = statusCode >= 500 ? "Internal server error" : err.message || "Error";
    res.status(statusCode).json({
        error: statusCode >= 500 ? "Internal server error" : err.name || "Error",
        message,
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