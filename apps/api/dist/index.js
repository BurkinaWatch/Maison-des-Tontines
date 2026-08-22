import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./config/logger.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import routes from "./routes.js";
import { getEnv } from "./config/env.js";
import { startWorkers } from "./jobs/reminder.job.js";
dotenv.config();
const env = getEnv();
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: env.CORS_ORIGIN.split(","),
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use(apiRateLimiter);
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use(env.API_PREFIX, routes);
app.use(notFoundHandler);
app.use(errorHandler);
async function start() {
    try {
        const prisma = (await import("./config/database.js")).getPrisma();
        await prisma.$connect();
        console.log("Database connected successfully");
        await startWorkers();
        console.log("BullMQ workers started");
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
            console.log(`API prefix: ${env.API_PREFIX}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    const prisma = (await import("./config/database.js")).getPrisma();
    await prisma.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    const prisma = (await import("./config/database.js")).getPrisma();
    await prisma.$disconnect();
    process.exit(0);
});
start();
export default app;
//# sourceMappingURL=index.js.map