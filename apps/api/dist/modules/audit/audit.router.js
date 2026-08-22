import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { z } from "zod";
import { AuditController } from "./audit.controller.js";
const router = Router();
const controller = new AuditController();
const QueryFiltersSchema = z.object({
    actorId: z.string().optional(),
    resource: z.string().optional(),
    resourceId: z.string().optional(),
    action: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.coerce.number().default(50),
    offset: z.coerce.number().default(0),
});
router.use(authMiddleware, requireRole("ADMIN", "SUPERVISOR"));
router.get("/", validate(QueryFiltersSchema, "query"), (req, res, next) => {
    controller.queryLogs(req, res, next);
});
router.get("/:id", (req, res, next) => {
    controller.getLog(req, res, next);
});
export default router;
//# sourceMappingURL=audit.router.js.map